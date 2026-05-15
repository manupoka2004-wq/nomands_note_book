-- TripMaker Enterprise Database Schema (PostgreSQL / Supabase)

-- Enums
CREATE TYPE user_role AS ENUM ('user', 'driver', 'admin');
CREATE TYPE ride_status AS ENUM ('requested', 'accepted', 'arrived', 'ongoing', 'completed', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE transaction_type AS ENUM ('credit', 'debit');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers Table
CREATE TABLE drivers (
    id UUID PRIMARY KEY REFERENCES users(id),
    license_number TEXT UNIQUE NOT NULL,
    is_available BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 5.0,
    total_rides INTEGER DEFAULT 0,
    current_lat DECIMAL(9,6),
    current_lng DECIMAL(9,6),
    last_location_update TIMESTAMP WITH TIME ZONE
);

-- Vehicles Table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    plate_number TEXT UNIQUE NOT NULL,
    color TEXT,
    vehicle_type TEXT -- 'sedan', 'suv', 'luxury'
);

-- Rides Table
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    driver_id UUID REFERENCES drivers(id),
    pickup_address TEXT NOT NULL,
    destination_address TEXT NOT NULL,
    pickup_lat DECIMAL(9,6) NOT NULL,
    pickup_lng DECIMAL(9,6) NOT NULL,
    dest_lat DECIMAL(9,6) NOT NULL,
    dest_lng DECIMAL(9,6) NOT NULL,
    status ride_status DEFAULT 'requested',
    fare DECIMAL(10,2),
    distance_km DECIMAL(10,2),
    duration_mins INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hotels Table
CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    rating DECIMAL(2,1),
    price_per_night DECIMAL(10,2),
    amenities TEXT[],
    images TEXT[]
);

-- Hotel Bookings
CREATE TABLE hotel_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    hotel_id UUID REFERENCES hotels(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price DECIMAL(10,2),
    status booking_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet System
CREATE TABLE wallets (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    balance DECIMAL(12,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD'
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(user_id),
    amount DECIMAL(12,2) NOT NULL,
    type transaction_type NOT NULL,
    description TEXT,
    reference_id TEXT, -- Stripe/Razorpay ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID REFERENCES rides(id),
    user_id UUID REFERENCES users(id),
    driver_id UUID REFERENCES drivers(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (Examples)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);

ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own rides" ON rides FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Drivers can view assigned rides" ON rides FOR SELECT USING (auth.uid() = driver_id);

-- Indexes
CREATE INDEX idx_rides_user ON rides(user_id);
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE INDEX idx_drivers_location ON drivers(current_lat, current_lng);
