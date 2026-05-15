import express from 'express';
import type { Request, Response } from 'express';
import compression from 'compression';
import NodeCache from 'node-cache';
import _ from 'lodash';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { z } from 'zod';
import { GoogleGenAI, Type } from "@google/genai";
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import Database from 'better-sqlite3';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Validation Schemas ---
const RideBookingSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  userPhone: z.string().optional(),
  pickup: z.string().min(1),
  drop: z.string().min(1),
  date: z.string(),
  time: z.string(),
});

import { CalculatorEngine } from './src/lib/calculator.ts';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? process.env.APP_URL : "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_circle', (circleId) => {
      socket.join(circleId);
      console.log(`Socket ${socket.id} joined circle ${circleId}`);
    });

    socket.on('send_message', (data) => {
      const { circleId, userId, userName, content, type = 'text' } = data;
      const messageId = 'MSG' + Date.now() + Math.random().toString(36).substr(2, 5);
      
      // Persist to database
      try {
        db.prepare('INSERT INTO messages (id, circle_id, user_id, content, type) VALUES (?, ?, ?, ?, ?)').run(
          messageId, circleId, userId, content, type
        );
      } catch (err) {
        console.error('Failed to persist message:', err);
      }

      // Broadcast to room
      io.to(circleId).emit('new_message', {
        id: messageId,
        circleId,
        userId,
        userName,
        content,
        type,
        created_at: new Date().toISOString()
      });
    });

    socket.on('typing', (data) => {
      const { circleId, userName, isTyping } = data;
      socket.to(circleId).emit('display_typing', { userName, isTyping });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  const PORT = 3000;
  const JWT_SECRET = process.env.JWT_SECRET || 'tripmaker-super-secret';
  const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  // Trust proxy for rate limiting and secure cookies
  app.set('trust proxy', 1);

  const RideRequestSchema = z.object({
    pickup: z.string(),
    destination: z.string(),
    distanceKm: z.number(),
    travelTimeMins: z.number(),
    vehicleType: z.enum(['bike', 'auto', 'sedan', 'suv', 'van']),
    surgeMultiplier: z.number().optional(),
    isNightCharge: z.boolean().optional(),
    tollCharges: z.number().optional(),
    waitingTimeMins: z.number().optional(),
    promoCode: z.string().optional(),
    fuelAdjustmentFactor: z.number().optional()
  });

  const HotelBudgetSchema = z.object({
    roomPricePerNight: z.number(),
    nights: z.number(),
    rooms: z.number(),
    foodBudgetPerDay: z.number(),
    localTransportPerDay: z.number()
  });

  const FullTripSchema = z.object({
    taxiInputs: RideRequestSchema,
    hotelInputs: HotelBudgetSchema,
    sightseeingBudget: z.number(),
    insuranceCost: z.number()
  });

  // --- Email Setup ---
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.warn('⚠️ GMAIL_USER or GMAIL_PASS not set. Emails will not be sent.');
  }

  // --- SMS Setup ---
  const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

  // --- Database Setup (SQLite for persistence) ---
  const db = new Database('tripmaker.db');
  db.pragma('journal_mode = WAL');

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      password TEXT,
      phone TEXT,
      avatar TEXT,
      bio TEXT,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'offline',
      last_seen DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS circles (
      id TEXT PRIMARY KEY,
      name TEXT,
      activity TEXT,
      type TEXT,
      creator_id TEXT,
      lat REAL,
      lng REAL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(creator_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS circle_members (
      circle_id TEXT,
      user_id TEXT,
      role TEXT DEFAULT 'member',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (circle_id, user_id),
      FOREIGN KEY(circle_id) REFERENCES circles(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      circle_id TEXT,
      user_id TEXT,
      content TEXT,
      type TEXT DEFAULT 'text',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(circle_id) REFERENCES circles(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      item_name TEXT,
      item_type TEXT,
      status TEXT,
      amount REAL,
      currency TEXT DEFAULT 'INR',
      pickup TEXT,
      "drop" TEXT,
      date TEXT,
      time TEXT,
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      razorpay_signature TEXT,
      payment_status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // Ensure columns exist in users table (SQLite migrations)
  const columns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  const columnNames = columns.map(c => c.name);
  
  const requiredColumns = [
    { name: 'avatar', type: 'TEXT' },
    { name: 'bio', type: 'TEXT' },
    { name: 'status', type: "TEXT DEFAULT 'offline'" },
    { name: 'last_seen', type: 'DATETIME' }
  ];

  for (const col of requiredColumns) {
    if (!columnNames.includes(col.name)) {
      try {
        db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Added column ${col.name} to users table.`);
      } catch (err) {
        console.error(`Error adding column ${col.name}:`, err);
      }
    }
  }

  // Ensure default users exist
  const ensureUser = (id: string, email: string, name: string, bio: string) => {
    const exists = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!exists) {
      db.prepare('INSERT INTO users (id, email, name, avatar, bio, status) VALUES (?, ?, ?, ?, ?, ?)').run(
        id, email, name, `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`, bio, 'offline'
      );
    }
  };

  ensureUser('system', 'hello@solocircle.com', 'Nomad Guide', 'Your AI companion for exploring the world.');
  ensureUser('alex', 'alex@travel.com', 'Alex', 'Backpacking through Asia.');
  ensureUser('guest', 'guest@example.com', 'Guest User', 'Quick explorer.');

  const circleCount = db.prepare('SELECT COUNT(*) as count FROM circles').get() as { count: number };
  if (circleCount.count === 0) {
    const chiangMaiId = 'CIR-CM-001';
    db.prepare('INSERT INTO circles (id, name, activity, type, creator_id, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      chiangMaiId, 'Chiang Mai Sunset Walk', 'Photography', 'public', 'system', 18.7883, 98.9853
    );
    db.prepare('INSERT INTO circle_members (circle_id, user_id, role) VALUES (?, ?, ?)').run(
      chiangMaiId, 'system', 'admin'
    );
    db.prepare('INSERT INTO circle_members (circle_id, user_id) VALUES (?, ?)').run(
      chiangMaiId, 'alex'
    );
    db.prepare('INSERT INTO messages (id, circle_id, user_id, content) VALUES (?, ?, ?, ?)').run(
      'MSG1', chiangMaiId, 'system', 'Welcome to the Chiang Mai Sunset Walk circle! Ready for some golden hour shots?'
    );
  }

  // In-memory stores for temporary data
  const otpStore = new Map<string, { otp: string, expires: number, phone: string }>();
  const pendingBookings = new Map<string, any>(); // bookingId -> bookingData

  // Security Middlewares
  app.use(morgan('dev', {
    skip: (req: Request, res: Response) => {
      // Skip logging for source files, node_modules, and common assets to reduce noise
      const url = req.url || '';
      return res.statusCode < 400 && (
        url.includes('/src/') || 
        url.includes('/node_modules/') ||
        url.includes('/@vite/') ||
        url.includes('/.vite/') ||
        url.endsWith('.ts') || 
        url.endsWith('.tsx') || 
        url.endsWith('.js') ||
        url.endsWith('.svg') || 
        url.endsWith('.css') || 
        url.endsWith('.png') ||
        url.endsWith('.ico') ||
        url.includes('hot-update')
      );
    }
  }));
  // Force the server to use compression
  app.use(compression());
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }));
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.APP_URL : "*",
  }));
  app.use(express.json());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Razorpay helper for lazy initialization
  let razorpayInstance: Razorpay | null = null;
  const getRazorpay = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.warn('⚠️ Razorpay credentials (RAZORPAY_KEY_ID/SECRET) are not fully configured. Falling back to MOCK mode.');
      return null; // Signals mock mode
    }

    if (!razorpayInstance) {
      try {
        razorpayInstance = new Razorpay({ key_id, key_secret });
      } catch (err) {
        console.error('Failed to initialize Razorpay instance:', err);
        return null;
      }
    }
    return razorpayInstance;
  };

  // --- SoloCircles & Chat API ---
  app.get('/api/circles', (req, res) => {
    try {
      const circles = db.prepare(`
        SELECT c.*, u.name as creator_name, 
        (SELECT COUNT(*) FROM circle_members WHERE circle_id = c.id) as members
        FROM circles c
        LEFT JOIN users u ON c.creator_id = u.id
        WHERE c.status = 'active'
        ORDER BY c.created_at DESC
      `).all();
      res.json(circles);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch circles' });
    }
  });

  app.post('/api/circles/create', (req, res) => {
    const { name, activity, type, creator_id, lat, lng } = req.body;
    const id = 'CIR' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    try {
      db.prepare('INSERT INTO circles (id, name, activity, type, creator_id, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        id, name, activity, type, creator_id || 'system', lat, lng
      );
      // Auto-join creator
      db.prepare('INSERT INTO circle_members (circle_id, user_id, role) VALUES (?, ?, ?)').run(
        id, creator_id || 'system', 'admin'
      );
      
      const circle = db.prepare('SELECT * FROM circles WHERE id = ?').get(id);
      res.json(circle);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create circle' });
    }
  });

  app.post('/api/circles/join', (req, res) => {
    const { circleId, userId } = req.body;
    try {
      db.prepare('INSERT OR IGNORE INTO circle_members (circle_id, user_id) VALUES (?, ?)').run(circleId, userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to join circle' });
    }
  });

  app.get('/api/circles/:id/messages', (req, res) => {
    const { id } = req.params;
    try {
      const messages = db.prepare(`
        SELECT m.*, u.name as user_name, u.avatar as user_avatar
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.circle_id = ?
        ORDER BY m.created_at ASC
      `).all(id);
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.get('/api/users/profile/:id', (req, res) => {
    const { id } = req.params;
    try {
      const user = db.prepare('SELECT id, name, email, avatar, bio, status, last_seen FROM users WHERE id = ?').get(id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // --- API Routes ---

  // --- OTP Helpers (Used for Bookings) ---
  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendOTP = async (email: string, phone: string | undefined, otp: string, type: 'registration' | 'booking' | 'reset' = 'registration') => {
    const subjects = {
      registration: "Your TripMaker Registration Code",
      booking: "Your TripMaker Booking Confirmation Code",
      reset: "Your TripMaker Password Reset Code"
    };

    const titles = {
      registration: "Registration Verification",
      booking: "Booking Confirmation",
      reset: "Password Reset"
    };

    // Email
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: `"TripMaker" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: subjects[type],
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #4f46e5; text-align: center;">${titles[type]}</h2>
              <p style="text-align: center; color: #666;">Your One-Time Password (OTP) is:</p>
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; margin: 30px 0; text-align: center; background: #f8fafc; padding: 20px; border-radius: 12px;">${otp}</div>
              <p style="text-align: center; color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('[OTP] Email failed:', err);
      }
    }

    // SMS (Optional)
    if (phone && twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const message = `TripMaker: Your ${titles[type]} code is ${otp}. Valid for 5 mins.`;
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
      } catch (err) {
        console.error('[OTP] SMS failed:', err);
      }
    }
  };

  // Ride Booking Route
  app.post('/api/booking/create', async (req, res) => {
    try {
      const { userId, userName, userEmail, userPhone, pickup, drop, date, time, item_name, item_type = 'taxi' } = req.body;
      
      const bookingId = 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const otp = generateOTP();
      const expires = Date.now() + 5 * 60 * 1000;

      // Store pending booking
      pendingBookings.set(bookingId, { ...req.body, id: bookingId });
      otpStore.set(bookingId, { otp, expires, phone: userPhone || '' });

      console.log(`[Booking] OTP for ${userEmail} & ${userPhone}: ${otp}`);

      await sendOTP(userEmail, userPhone, otp, 'booking');

      res.json({ 
        success: true, 
        bookingId, 
        otpRequired: true,
        otp: process.env.NODE_ENV === 'production' ? undefined : otp,
        message: 'OTP sent to your email and phone' 
      });
    } catch (error) {
      console.error('[Booking] Error:', error);
      res.status(500).json({ error: 'Failed to initiate booking' });
    }
  });

  app.post('/api/booking/verify', async (req, res) => {
    try {
      const { bookingId, otp } = req.body;
      if (!bookingId || !otp) {
        return res.status(400).json({ error: 'bookingId and otp are required' });
      }

      const stored = otpStore.get(bookingId);
      const pending = pendingBookings.get(bookingId);

      if (!stored || !pending) {
        return res.status(400).json({ error: 'No pending booking found' });
      }

      if (stored.otp !== otp || Date.now() > stored.expires) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // OTP Verified - Create Booking
      const { userName, userEmail, userPhone, pickup, drop, date, time, userId, item_name, item_type = 'taxi', amount } = pending;
      const dateTime = `${date} ${time}`;

      // 1. Send Final Email Confirmation
      if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        try {
          await transporter.sendMail({
            from: `"TripMaker" <${process.env.GMAIL_USER}>`,
            to: userEmail,
            subject: "Booking Confirmed!",
            html: `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #10B981; text-align: center;">Booking Confirmed!</h2>
                <p>Hello ${userName},</p>
                <p>Your booking for <strong>${item_name || (pickup + ' to ' + drop)}</strong> has been successfully confirmed.</p>
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
                  <p style="margin: 5px 0;"><strong>Type:</strong> ${item_type.toUpperCase()}</p>
                  ${pickup ? `<p style="margin: 5px 0;"><strong>From:</strong> ${pickup}</p>` : ''}
                  ${drop ? `<p style="margin: 5px 0;"><strong>To:</strong> ${drop}</p>` : ''}
                  <p style="margin: 5px 0;"><strong>Date/Time:</strong> ${dateTime}</p>
                </div>
                <p style="text-align: center; color: #666;">Thank you for choosing TripMaker!</p>
              </div>
            `
          });
        } catch (err) {
          console.error('[Booking] Final email failed:', err);
        }
      }

      // 2. Send Final SMS Confirmation
      if (twilioClient && process.env.TWILIO_PHONE_NUMBER && userPhone) {
        try {
          const message = `TripMaker: Hello ${userName}! Your booking (${item_type}) is confirmed. ID: ${bookingId}. at ${dateTime}.`;
          await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: userPhone
          });
        } catch (err) {
          console.error('[Booking] Final SMS failed:', err);
        }
      }

      // Store in database
      const newBooking = {
        id: bookingId,
        user_id: userId,
        userName,
        userEmail,
        userPhone,
        item_name: item_name || `Ride from ${pickup} to ${drop}`,
        item_type: item_type,
        status: 'confirmed',
        pickup,
        drop,
        date,
        time,
        amount: amount || 0
      };

      try {
        db.prepare(`
          INSERT INTO bookings (id, user_id, item_name, item_type, status, pickup, "drop", date, time, amount)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          newBooking.id,
          newBooking.user_id,
          newBooking.item_name,
          newBooking.item_type,
          newBooking.status,
          newBooking.pickup || '',
          newBooking.drop || '',
          newBooking.date,
          newBooking.time,
          newBooking.amount
        );
      } catch (err) {
        console.error('[Booking] Database error during booking creation:', err);
      }

      // Cleanup
      otpStore.delete(bookingId);
      pendingBookings.delete(bookingId);

      res.json({ success: true, bookingId, booking: newBooking, message: 'Booking confirmed' });
    } catch (error) {
      console.error('[Booking] Verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/bookings', async (req, res) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    
    try {
      if (userId === 'all') {
        const allBookings = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
        return res.json(allBookings);
      }
      
      const userBookings = db.prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC').all(userId);
      res.json(userBookings);
    } catch (err) {
      console.error('[Booking] Error fetching bookings:', err);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  // --- Payment Routes ---

  app.post('/api/payments/create-order', async (req, res) => {
    try {
      const { amount: rawAmount, currency = 'INR', bookingData } = req.body;
      const amount = Number(rawAmount);

      if (isNaN(amount) || amount <= 0) {
        console.error('[Payment] Invalid amount received:', rawAmount);
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      const rzp = getRazorpay();
      let order;

      if (rzp) {
        try {
          const options = {
            amount: Math.round(amount * 100), // amount in smallest currency unit
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1 // Auto-capture payment
          };
          order = await rzp.orders.create(options);
        } catch (err) {
          console.error('[Razorpay] Order creation failed in production:', err);
          return res.status(500).json({ error: 'Failed to create Razorpay order' });
        }
      } else {
        // Mock Order
        order = {
          id: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
          amount: Math.round(amount * 100),
          currency: currency
        };
      }
      
      // Save pending booking
      const bookingId = 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const finalUserId = bookingData?.userId || 'guest';

      // Ensure user exists in our local DB to avoid Foreign Key constraints on demo accounts
      if (finalUserId) {
        ensureUser(
          finalUserId, 
          bookingData?.userEmail || `${finalUserId}@example.com`, 
          bookingData?.userName || 'Traveler', 
          'Auto-created during booking'
        );
      }
      
      try {
        db.prepare(`
          INSERT INTO bookings (id, user_id, item_name, item_type, status, amount, pickup, "drop", date, time, razorpay_order_id, payment_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          bookingId,
          finalUserId,
          bookingData?.item_name || `Booking at ${bookingData?.destination || 'Destination'}`,
          bookingData?.item_type || 'taxi',
          'pending',
          amount,
          bookingData?.pickup || '',
          bookingData?.drop || bookingData?.destination || '',
          bookingData?.date || new Date().toISOString().split('T')[0],
          bookingData?.time || new Date().toLocaleTimeString(),
          order.id,
          'PENDING'
        );
      } catch (dbErr) {
        console.error('[Payment] Database error during order creation:', dbErr);
        // We still return the order so the user can pay, but the record might be missing.
        // In a real app we might want to fail the request if DB fails.
      }

      res.json({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        bookingId,
        isMock: !rzp
      });
    } catch (error: any) {
      console.error('[Payment] Order Creation Error:', error);
      res.status(500).json({ error: error.message || 'Failed to create payment order' });
    }
  });

  app.post('/api/payments/verify', async (req, res) => {
    try {
      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        bookingDetails
      } = req.body;

      let isSignatureValid = false;

      if (razorpay_order_id.startsWith('order_mock_')) {
        isSignatureValid = true;
      } else {
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) return res.status(500).json({ error: 'Razorpay secret missing' });

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac("sha256", secret)
          .update(body.toString())
          .digest("hex");

        isSignatureValid = (expectedSignature === razorpay_signature);
      }

      if (isSignatureValid) {
        const bookingId = bookingDetails?.id;
        
        db.prepare(`
          UPDATE bookings 
          SET status = 'confirmed', 
              payment_status = 'SUCCESS', 
              razorpay_payment_id = ?, 
              razorpay_signature = ?
          WHERE id = ? OR razorpay_order_id = ?
        `).run(razorpay_payment_id || 'pay_mock', razorpay_signature || 'sig_mock', bookingId || '', razorpay_order_id);

        res.json({ success: true, message: 'Payment verified successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
    } catch (error) {
      console.error('[Payment] Verification Error:', error);
      res.status(500).json({ error: 'Payment verification failed' });
    }
  });

  app.post('/api/payments/webhook', async (req, res) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers['x-razorpay-signature'];

      const expectedSignature = crypto
        .createHmac('sha256', secret || '')
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature === signature) {
        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'payment.captured') {
          const orderId = payload.payment.entity.order_id;
          const paymentId = payload.payment.entity.id;
          
          db.prepare(`
            UPDATE bookings 
            SET status = 'confirmed', 
                payment_status = 'SUCCESS', 
                razorpay_payment_id = ?
            WHERE razorpay_order_id = ?
          `).run(paymentId, orderId);
        } else if (event === 'payment.failed') {
          const orderId = payload.payment.entity.order_id;
          db.prepare(`
            UPDATE bookings SET payment_status = 'FAILED' WHERE razorpay_order_id = ?
          `).run(orderId);
        }

        res.json({ status: 'ok' });
      } else {
        res.status(400).send('Invalid signature');
      }
    } catch (error) {
      console.error('[Razorpay] Webhook Error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Modify existing booking route to store as PENDING with order_id
  app.post('/api/booking/initiate', async (req, res) => {
    try {
      const { userId, userName, userEmail, userPhone, pickup, drop, date, time, item_name, item_type, amount, razorpay_order_id } = req.body;
      
      const bookingId = 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();

      db.prepare(`
        INSERT INTO bookings (id, user_id, item_name, item_type, status, amount, pickup, "drop", date, time, razorpay_order_id, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        bookingId,
        userId,
        item_name || `Ride from ${pickup} to ${drop}`,
        item_type,
        'pending',
        amount,
        pickup || '',
        drop || '',
        date,
        time,
        razorpay_order_id,
        'PENDING'
      );

      res.json({ success: true, bookingId });
    } catch (error) {
      console.error('[Booking] Initiation Error:', error);
      res.status(500).json({ error: 'Failed to initiate booking' });
    }
  });

  // Cache Initialization
  const placesCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

  interface SearchResult {
    id: string;
    name: string;
    lat: number;
    lon: number;
    type: 'hotel' | 'restaurant' | 'attraction' | 'museum' | 'temple' | 'landmark';
    address: string;
    rating: number;
    distance: number;
    popularity: number;
    score?: number;
    tags?: string[];
  }

  // Proxy for Overpass API to avoid CORS issues in browser
  // Smart deduplication helper
  const deduplicateResults = (results: SearchResult[]) => {
    // 1. Prioritize by source (Geoapify > Overpass > Fallback)
    // 2. Fuzzy name matching
    // 3. ID matching
    const unique = new Map<string, SearchResult>();
    
    // Sort so Geoapify (which has better IDs) comes first
    const sorted = _.orderBy(results, [(r) => r.id.startsWith('geo_') ? 0 : 1], ['asc']);
    
    sorted.forEach(r => {
      const key = r.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (!unique.has(key)) {
        unique.set(key, r);
      }
    });
    
    return Array.from(unique.values());
  };

  // Dedicated Hotel Search Endpoint
  app.get('/api/hotels', async (req, res) => {
    const { city, lat, lon } = req.query;
    console.log(`[API] Hotel Search Request: city=${city}, lat=${lat}, lon=${lon}`);
    
    if (!lat || !lon) return res.status(400).json({ error: 'Coordinates required' });

    const searchLat = parseFloat(lat as string);
    const searchLon = parseFloat(lon as string);
    
    const cacheKey = `hotels_v7_${searchLat.toFixed(3)}_${searchLon.toFixed(3)}`;
    const cached = placesCache.get(cacheKey);
    if (cached) return res.json(cached);

    try {
      // Parallel fetch from multiple sources
      const resultsArr = await Promise.allSettled([
        fetchFromGeoapifyInternal(searchLat, searchLon, 15000, 'hotel'),
        fetchFromOverpassInternal(searchLat, searchLon, 15000, 'hotel')
      ]);

      let results: SearchResult[] = [];
      resultsArr.forEach(r => { if (r.status === 'fulfilled') results = [...results, ...r.value]; });
      
      results = deduplicateResults(results);

      if (results.length === 0) {
        throw new Error('No hotel results found from external APIs');
      }

      // Ranking
      const maxDist = Math.max(...results.map(r => r.distance || 0.1)) || 1;
      const scored = results.map(r => {
        const score = (0.5 * ((r.rating || 4) / 5)) + (0.3 * (1 - (r.distance || 0) / maxDist)) + (0.2 * (r.popularity || 0.5));
        return { ...r, score };
      });

      const final = _.orderBy(scored, ['score'], ['desc']).slice(0, 30);
      
      placesCache.set(cacheKey, { elements: final });
      res.json({ elements: final });
    } catch (error) {
      console.warn('[API] Hotel search using backup mock data due to:', error instanceof Error ? error.message : 'timeout');
      const mockHotels = [
        { id: 'mock-hotel-1', name: 'Grand Elite Residency', lat: searchLat + 0.005, lon: searchLon + 0.005, type: 'hotel', address: 'Heritage Square, Downtown', rating: 4.8, distance: 0.4, popularity: 0.9 },
        { id: 'mock-hotel-2', name: 'Azure Bay Resort & Spa', lat: searchLat - 0.008, lon: searchLon + 0.01, type: 'hotel', address: 'Ocean Front Road', rating: 4.6, distance: 1.1, popularity: 0.85 },
        { id: 'mock-hotel-3', name: 'The Urban Boutique', lat: searchLat + 0.012, lon: searchLon - 0.005, type: 'hotel', address: 'Fashion Avenue', rating: 4.4, distance: 1.5, popularity: 0.75 },
        { id: 'mock-hotel-4', name: 'Sunset Vista Suites', lat: searchLat + 0.002, lon: searchLon + 0.015, type: 'hotel', address: 'Sunset Strip', rating: 4.5, distance: 0.9, popularity: 0.8 }
      ];
      return res.json({ elements: mockHotels });
    }
  });

  // Internal helper versions of search functions (refactored for reuse)
  const fetchFromGeoapifyInternal = async (lat: number, lon: number, radius: number, type: string): Promise<SearchResult[]> => {
    const GEOAPIFY_KEY = process.env.GEOAPIFY_API_KEY;
    if (!GEOAPIFY_KEY) return [];
    
    let categories = 'accommodation.hotel';
    if (type === 'restaurant') categories = 'catering.restaurant,catering.cafe';
    else if (type === 'all' || type === 'explore') categories = 'accommodation.hotel,catering.restaurant,catering.cafe,tourism.attraction,leisure.park,heritage';
    
    const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},${radius}&limit=50&apiKey=${GEOAPIFY_KEY}`;
    const resp = await axios.get(url, { timeout: 8000 });
    return resp.data.features.map((f: any) => ({
      id: f.properties.place_id,
      name: f.properties.name || f.properties.formatted.split(',')[0],
      lat: f.properties.lat,
      lon: f.properties.lon,
      type: (f.properties.categories || []).includes('accommodation.hotel') ? 'hotel' : 
            (f.properties.categories || []).includes('catering.restaurant') ? 'restaurant' : 'attraction',
      address: f.properties.address_line1 || f.properties.formatted,
      rating: f.properties.rating || (3.5 + Math.random() * 1.5),
      distance: (f.properties.distance || 0) / 1000,
      popularity: f.properties.rank?.popularity || Math.random()
    }));
  };

  const fetchFromOverpassInternal = async (lat: number, lon: number, radius: number, type: string): Promise<SearchResult[]> => {
    let typeQuery = '';
    if (type === 'hotel') {
      typeQuery = `
        node["tourism"~"hotel|guest_house|hostel|motel|resort|apartment|chalet"](around:${radius},${lat},${lon});
        way["tourism"~"hotel|guest_house|hostel|motel|resort|apartment|chalet"](around:${radius},${lat},${lon});
        rel["tourism"~"hotel|guest_house|hostel|motel|resort|apartment|chalet"](around:${radius},${lat},${lon});
      `;
    } else if (type === 'restaurant') {
      typeQuery = `
        node["amenity"~"restaurant|cafe|bar|pub|fast_food|food_court"](around:${radius},${lat},${lon});
        way["amenity"~"restaurant|cafe|bar|pub|fast_food|food_court"](around:${radius},${lat},${lon});
        rel["amenity"~"restaurant|cafe|bar|pub|fast_food|food_court"](around:${radius},${lat},${lon});
      `;
    } else {
      typeQuery = `
        node["tourism"~"hotel|guest_house|hostel|attraction|museum|viewpoint|monument"](around:${radius},${lat},${lon});
        way["tourism"~"hotel|guest_house|hostel|attraction|museum|viewpoint|monument"](around:${radius},${lat},${lon});
        rel["tourism"~"hotel|guest_house|hostel|attraction|museum|viewpoint|monument"](around:${radius},${lat},${lon});
        node["historic"](around:${radius},${lat},${lon});
        way["historic"](around:${radius},${lat},${lon});
        node["amenity"~"restaurant|cafe"](around:${radius},${lat},${lon});
      `;
    }

    const overpassQuery = `
      [out:json][timeout:10][maxsize:1000000];
      (
        ${typeQuery.replace(/rel\[.*?\]\(.*?\);/g, '').replace(/way\[.*?\]\(.*?\);/g, 'way[\"tourism\"=\"hotel\"](around:radius,lat,lon);')}
      );
      out center;
    `;
    // Use a clean subset of typeQuery if it contains ways to avoid massive data downloads
    const fastTypeQuery = type === 'hotel' 
      ? `node["tourism"~"hotel|guest_house|resort"](around:${radius},${lat},${lon});
         way["tourism"~"hotel|guest_house|resort"](around:${radius},${lat},${lon});`
      : type === 'restaurant'
      ? `node["amenity"~"restaurant|cafe"](around:${radius},${lat},${lon});`
      : `node["tourism"~"attraction|museum|viewpoint"](around:${radius},${lat},${lon});`;

    const fastQuery = `[out:json][timeout:10];(${fastTypeQuery});out center;`;

    const endpoints = ['https://overpass-api.de/api/interpreter', 'https://lz4.overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
    for (const endpoint of endpoints) {
      try {
        const resp = await axios.post(endpoint, fastQuery, { 
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, 
          timeout: 8000 
        });
        return (resp.data.elements || []).filter((el: any) => el.tags && el.tags.name).map((el: any) => {
          const elLat = el.lat || (el.center ? el.center.lat : lat);
          const elLon = el.lon || (el.center ? el.center.lon : lon);
          
          let resultType: 'hotel' | 'restaurant' | 'attraction' = 'attraction';
          if (el.tags.tourism && ["hotel", "guest_house", "hostel", "motel", "resort", "apartment", "chalet"].includes(el.tags.tourism)) {
            resultType = 'hotel';
          } else if (el.tags.amenity && ["restaurant", "cafe", "bar", "pub", "fast_food", "food_court"].includes(el.tags.amenity)) {
            resultType = 'restaurant';
          }

          return {
            id: el.id.toString(),
            name: el.tags.name,
            lat: elLat,
            lon: elLon,
            type: resultType,
            address: el.tags['addr:street'] || el.tags['addr:city'] || el.tags['addr:full'] || 'Nearby Location',
            rating: 3.8 + Math.random() * 1.2,
            distance: 0,
            popularity: 0.4 + Math.random() * 0.6
          };
        });
      } catch (e) { 
        // Silent fail to avoid log spam, the caller handles empty results
        continue; 
      }
    }
    return [];
  };

  // --- Place Discovery Multi-Source Helpers ---
  const fetchImageFromUnsplash = async (query: string, category: string): Promise<string> => {
    const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
    const type = category.toLowerCase();
    
    // Quality fallback images for the travel context
    const fallbacks: Record<string, string[]> = {
      hotel: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        'https://images.unsplash.com/photo-1551882547-ff43c61f3635',
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'
      ],
      restaurant: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0'
      ],
      landmark: [
        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470'
      ]
    };

    const searchCat = type.includes('hotel') ? 'hotel' : type.includes('restaurant') ? 'restaurant' : 'landmark';
    const randomFallback = fallbacks[searchCat][Math.floor(Math.random() * fallbacks[searchCat].length)];

    if (!UNSPLASH_KEY) {
      return `${randomFallback}?auto=format&fit=crop&w=800&q=80`;
    }
    try {
      const resp = await axios.get(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' ' + category)}&per_page=1`, {
        headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
        timeout: 3000
      });
      return resp.data.results[0]?.urls?.regular || `${randomFallback}?auto=format&fit=crop&w=800&q=80`;
    } catch (e) {
      return `${randomFallback}?auto=format&fit=crop&w=800&q=80`;
    }
  };

  const fetchFromOpenTripMap = async (lat: number, lon: number, radius: number): Promise<SearchResult[]> => {
    const OTM_KEY = process.env.OPENTRIPMAP_API_KEY;
    if (!OTM_KEY) return [];
    try {
      const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&apikey=${OTM_KEY}&limit=50`;
      const resp = await axios.get(url, { timeout: 8000 });
      return resp.data.features.map((f: any) => ({
        id: `otm_${f.properties.xid}`,
        name: f.properties.name || 'Interesting Place',
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        type: 'attraction',
        address: f.properties.kinds?.split(',')[0] || 'Tourist Attraction',
        rating: Math.min(5, (f.properties.rate || 3) / 1.4),
        distance: f.properties.dist / 1000,
        popularity: (f.properties.rate || 1) / 7
      })).filter((r: any) => r.name !== 'Interesting Place');
    } catch (e) { return []; }
  };

  const fetchFromFoursquare = async (lat: number, lon: number, radius: number, type: string): Promise<SearchResult[]> => {
    const FS_KEY = process.env.FOURSQUARE_API_KEY;
    if (!FS_KEY) return [];
    try {
      const categories = type === 'hotel' ? '19014' : type === 'restaurant' ? '13000' : '10000,16000';
      const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lon}&radius=${radius}&categories=${categories}&limit=30`;
      const resp = await axios.get(url, {
        headers: { Authorization: FS_KEY },
        timeout: 8000
      });
      return resp.data.results.map((r: any) => ({
        id: `fs_${r.fsq_id}`,
        name: r.name,
        lat: r.geocodes.main.latitude,
        lon: r.geocodes.main.longitude,
        type: type === 'hotel' ? 'hotel' : type === 'restaurant' ? 'restaurant' : 'attraction',
        address: r.location.formatted_address || r.location.address || 'Nearby',
        rating: (r.rating || 7) / 2, // Foursquare uses 10 scale
        distance: r.distance / 1000,
        popularity: (r.popularity || 0.5)
      }));
    } catch (e) { return []; }
  };

  // Dedicated Nearby Places Discovery Endpoint (POST for better params handling)
  app.post('/api/places/nearby', async (req, res) => {
    console.log('[API] /api/places/nearby request:', req.body);
    let { lat, lon, radius = 5000, type = 'all' } = req.body;
    
    if (!lat || !lon) return res.status(400).json({ error: 'Coordinates required' });

    const searchLat = parseFloat(lat);
    const searchLon = parseFloat(lon);
    
    const cacheKey = `places_v3_${searchLat.toFixed(4)}_${searchLon.toFixed(4)}_${radius}_${type}`;
    const cachedData = placesCache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    try {
      const fetchAll = async (currentRadius: number): Promise<SearchResult[]> => {
        const results = await Promise.allSettled([
          fetchFromGeoapifyInternal(searchLat, searchLon, currentRadius, type),
          fetchFromOverpassInternal(searchLat, searchLon, currentRadius, type),
          fetchFromOpenTripMap(searchLat, searchLon, currentRadius),
          fetchFromFoursquare(searchLat, searchLon, currentRadius, type)
        ]);
        
        let merged: SearchResult[] = [];
        results.forEach(r => { if (r.status === 'fulfilled') merged = [...merged, ...r.value]; });
        return merged;
      };

      let rawResults = await fetchAll(radius);
      
      // Smart Fallback: Dynamic Radius Expansion for better UX
      if (rawResults.length < 3 && radius < 30000) {
        console.log(`[Places] Low results (${rawResults.length}), expanding radius to ${radius * 3}m...`);
        rawResults = await fetchAll(radius * 3);
      }

      // Fallback: If still no results, provide a high-quality mock set
      if (rawResults.length === 0) {
        console.warn('[Places] No results from external APIs. Using high-quality mock fallback.');
        const mockNames = type === 'hotel' 
          ? ['Grand Regency Hotel', 'Azure Breeze Inn', 'The Nomad House', 'Skyline View Suites', 'Emerald Garden Resort']
          : type === 'restaurant'
          ? ['The Spice Lab', 'Urban Bistro', 'Ocean Catch Seafood', 'Sunset Cafe', 'Soul Food Bistro']
          : ['Central Park', 'Historical Museum', 'Art Center', 'Mountain Lookout', 'Ancient Temple'];
          
        rawResults = mockNames.map((name, i) => ({
          id: `mock_${type}_${i}_${Date.now()}`,
          name,
          lat: searchLat + (Math.random() - 0.5) * 0.02,
          lon: searchLon + (Math.random() - 0.5) * 0.02,
          type: (type === 'hotel' || type === 'restaurant' ? type : 'attraction') as any,
          address: `${100 + i * 12} City Center Blvd`,
          rating: 4.2 + (Math.random() * 0.8),
          distance: 0.5 + (Math.random() * 2),
          popularity: 0.6 + (Math.random() * 0.4)
        }));
      }

      // Deduplication process
      const uniqueResultsMap = new Map<string, SearchResult>();
      rawResults.forEach(r => {
        if (!r.name) return;
        const fuzzyName = r.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        const existing = uniqueResultsMap.get(fuzzyName);
        if (!existing || (r.rating || 0) > (existing.rating || 0)) {
          uniqueResultsMap.set(fuzzyName, r);
        }
      });
      
      let finalResults = Array.from(uniqueResultsMap.values());

      // Ranking & Scoring
      const maxDist = Math.max(...finalResults.map(r => r.distance || 0.1)) || 1;
      const scoredResults = finalResults.map(r => {
        const normRating = (r.rating || 4) / 5;
        const normDist = 1 - ((r.distance || 0) / maxDist);
        const score = (0.5 * normRating) + (0.3 * normDist) + (0.2 * (r.popularity || 0.5));
        
        const tags: string[] = [];
        if ((r.rating || 0) >= 4.5) tags.push('Top Rated');
        if ((r.distance || 0) <= 1) tags.push('Nearby');
        if ((r.popularity || 0) > 0.8) tags.push('Trending');
        
        return { ...r, score, tags };
      });

      const sorted = _.orderBy(scoredResults, ['score'], ['desc']).slice(0, 40);

      // Final processing: images and structure
      const responseElements = await Promise.all(sorted.map(async (r) => {
        const image = await fetchImageFromUnsplash(r.name, r.type === 'hotel' ? 'hotel luxury' : r.type === 'restaurant' ? 'restaurant' : 'landmark');

        return {
          id: r.id,
          lat: r.lat,
          lon: r.lon,
          tags: {
            name: r.name,
            type: r.type,
            address: r.address || 'Location nearby',
            rating: parseFloat((r.rating || 4.2).toFixed(1)),
            price: r.type === 'hotel' ? 1200 + Math.floor((r.popularity || 0.5) * 4000) : 400 + Math.floor((r.popularity || 0.5) * 1500),
            distance: parseFloat((r.distance || 0.5).toFixed(1)),
            image: image,
            tags: r.tags || [],
            score: r.score || 0.5
          }
        };
      }));

      const response = { elements: responseElements };
      placesCache.set(cacheKey, response);
      res.json(response);

    } catch (error) {
      console.error('[Places Aggregator] Error:', error);
      res.status(500).json({ error: 'Place search failed' });
    }
  });

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- Calculation Engine Routes ---

  app.post('/api/calculate/taxi', (req, res) => {
    try {
      const inputs = RideRequestSchema.parse(req.body);
      const result = CalculatorEngine.calculateTaxiFare(inputs);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
      res.status(500).json({ error: 'Calculation failed' });
    }
  });

  app.post('/api/calculate/hotel', (req, res) => {
    try {
      const inputs = HotelBudgetSchema.parse(req.body);
      const result = CalculatorEngine.calculateHotelBudget(inputs);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
      res.status(500).json({ error: 'Calculation failed' });
    }
  });

  app.post('/api/calculate/trip', (req, res) => {
    try {
      const inputs = FullTripSchema.parse(req.body);
      const result = CalculatorEngine.calculateFullTrip(inputs);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
      res.status(500).json({ error: 'Calculation failed' });
    }
  });

  app.get('/api/calculate/surge', (req, res) => {
    res.json({ multiplier: CalculatorEngine.getDynamicSurge() });
  });

  // Catch-all for /api to log 404s
  app.all('/api/*', (req, res) => {
    console.warn(`[API] 404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'API route not found' });
  });

  // --- Vite Integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(50));
    console.log(`🚀 TripMaker Enterprise Server is LIVE!`);
    console.log(`🔗 Access your website at: http://localhost:${PORT}`);
    console.log(`⚠️  IMPORTANT: Do NOT use port 5173. Use port ${PORT} for API calls.`);
    console.log('='.repeat(50) + '\n');
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
