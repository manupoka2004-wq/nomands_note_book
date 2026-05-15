This project is a Full-Stack AI Travel Planner & Booking Platform called TripMaker.
🌍 Project Overview: TripMaker AI
TripMaker is a comprehensive travel companion that leverages AI to plan routes, discover hidden gems, and handle the entire booking flow—from transport to hotels—with integrated payment processing.
🚀 Key Features
AI Route Planner: Uses the Google Gemini API to analyze travel routes and suggest nearby attractions, sights, and natural landmarks along the path.
Smart Booking System:
Travel Booking: Intelligent ride-hailing interface with multi-stop support.
Hotel Booking: Seamless search and confirmation flow for accommodations.
Interactive Maps: Real-time map integration using Leaflet and OpenStreetMap (Nominatim/OSRM) for route visualization and location searching.
Integrated Payments: Real-world payment flow using Razorpay, including order creation and signature verification.
Multi-Modal Authentication: Secure login via Firebase Auth supporting both Google Sign-In and an anonymous "Demo Mode" for quick exploration.
Social Circles: A "Solo Circles" feature designed for group travel and community sharing.
Safety & Emergency: Dedicated providers and layouts for traveller safety and emergency assistance.
🛠️ Tech Stack
Frontend:
Framework: React 18+ (Vite)
Language: TypeScript
Styling: Tailwind CSS
Animations: Framer Motion (motion/react)
Icons: Lucide React
Maps: Leaflet / React-Leaflet
State Management: React Context API
Backend (Serverless/Edge API):
Runtime: Node.js (Express)
API Proxying: Handles secure requests to Gemini, Razorpay, and Geospatial APIs.
Database: Firebase Firestore (NoSQL)
Storage: Firebase Storage
Integrations:
AI: Google Gemini API (@google/genai)
Payments: Razorpay API
Geocoding/Routing: OpenStreetMap (Nominatim), OSRM, Geoapify
Database/Auth: Firebase
📂 Recommended Repository Structure
code
Text
├── src/
│   ├── components/       # Reusable UI (TravelBookingForm, HotelBookingForm, etc.)
│   ├── pages/            # Main views (RoutePlanner, TravelBooking, Auth, etc.)
│   ├── services/         # API wrappers (osmService, geminiService, travelService)
│   ├── lib/              # Utils and Firebase configuration
│   ├── contexts/         # Auth and Safety Contexts
│   ├── layouts/          # Responsive Mobile/Desktop layouts
│   └── types.ts          # Global TypeScript interfaces
├── server.ts             # Express backend for API routes and payment logic
├── firestore.rules       # Security rules for the Firestore database
├── .env.example          # Template for required environment variables
└── README.md             # Project documentation
🔑 Environment Variables (.env)
To get this project running on GitHub/locally, you will need to set up the following keys in your environment:
code
Env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id

# AI & External APIs
GEMINI_API_KEY=your_gemini_key
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
GEOAPIFY_API_KEY=your_geoapify_key
Note for GitHub: When you upload your project, ensure that your firebase-applet-config.json is added to your .gitignore or replace the values with environment variable references (as we implemented in src/lib/firebase.ts) to keep your secrets safe.
