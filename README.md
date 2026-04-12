# Construction Lead Generator App

A cross-platform mobile and web application for homeowners to generate construction material quotes using AI-powered photo analysis, compare prices from major retailers, and connect with qualified contractors.

## 🚀 Features

### MVP (Current)
- 📸 **Photo Upload & Analysis**: Upload construction photos and get AI-powered material estimates using OpenAI Vision API
- � **Blueprint Analysis**: Upload architectural drawings/blueprints for precise measurements and comprehensive material lists
- 🏛️ **Building Code Integration**: AI reads local building codes (city/county/state) to identify required hardware and compliance needs
- �💰 **Price Comparison**: Compare material prices from Home Depot, Lowes, and Ace Hardware
- 📊 **Material Quotes**: Generate detailed material lists with quantities and pricing- 👤 **User Profiles**: Homeowner and contractor account management
- 💳 **Contractor Subscriptions**: 30-day free trial, then $49.99/month for qualified leads
### Coming Soon
- 👷 **Contractor Matching**: Connect homeowners with qualified, verified contractors
- 💳 **Contractor Memberships**: Stripe-powered subscription system for contractors
- 📋 **Permit Assistance**: Location-based construction permit requirements and guidance
- 🏪 **App Store Deployment**: iOS (App Store) and Android (Google Play) releases

## 📁 Project Structure

```
construction-lead-app/
├── mobile/              # React Native (Expo) mobile app
│   ├── screens/         # App screens
│   ├── App.tsx          # Main app entry
│   └── package.json
├── backend/             # Next.js backend & web dashboard
│   ├── app/api/         # API routes
│   │   ├── photos/      # Photo upload endpoints
│   │   ├── ai/          # AI analysis endpoints
│   │   └── quotes/      # Quote generation endpoints
│   └── package.json
├── database/            # Database schemas
│   └── schema.sql       # PostgreSQL schema
├── .env.example         # Environment variables template
└── README.md
```

## 🛠️ Tech Stack

**Frontend (Mobile)**
- React Native (Expo)
- TypeScript
- Expo Image Picker

**Backend**
- Next.js 15 (App Router)
- TypeScript
- OpenAI API (GPT-4 Vision)
- PostgreSQL (planned)
- AWS S3 (planned)

**Future Integrations**
- Stripe (payments)
- Puppeteer/Playwright (price scraping)
- Google Maps API (geolocation)

## 📋 Prerequisites

- Node.js 18+ and npm
- Expo CLI
- OpenAI API key (for AI analysis)
- PostgreSQL (for production)

## ⚙️ Setup Instructions

### 1. Clone and Install

```bash
cd construction-lead-app

# Install all dependencies (root, mobile, backend)
npm run install:all
```

### 2. Environment Configuration

Copy `.env.example` to `.env` in the backend directory:

```bash
cd backend
cp ../.env.example .env
```

Edit `.env` and add your API keys:

```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/construction_leads
```

### 3. Database Setup (Optional for MVP)

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE construction_leads;"

# Run schema
psql -U postgres -d construction_leads -f database/schema.sql
```

## 🚀 Running the Application

### Start BuildVault Internet Platform (Web)

From the repository root:

```bash
npm run dev
# or
npm run web
# or
npm run backend
```

Internet platform runs on: http://localhost:3000

### Start Backend (Next.js API)

```bash
npm run backend
# or
cd backend && npm run dev
```

Backend runs on: http://localhost:3000

> Note: `buildvault-start-app.bat` and `buildvault-open-app.html` launch Expo web on port 8081 for the mobile app shell, not the BuildVault internet platform.

### Start Mobile App (Expo)

```bash
npm run mobile
# or
cd mobile && npm start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)
- Press `w` for web browser
- Scan QR code with Expo Go app on your phone

## 📱 Mobile App Screens

1. **Blueprint Upload Screen** - Professional blueprint analysis with building code compliance
4. **Analysis Results** - AI-generated measurements and material lists
5. **Photo Upload Screen** - Camera/gallery integration with AI analysis
3. **Analysis Results** - AI-generated measurements and material lists
4. **Quote Screen** (Coming Soon) - Price comparison from retailers

## 🔌 API Endpoints

### Photo Upload
```
POST /api/photos/upload
Body: FormData with 'photo' file and 'projectId'
```

### AI Photo Analysis
```
POST /api/ai/analyze-photo
Body: { photoUrl: string, projectType: string }
Response: { analysis: { measurements, materials, condition, recommendations } }
```
AI Blueprint Analysis
```
POST /api/ai/analyze-blueprint
Body: { blueprintUrl: string, location?: { city, county, state, zipCode } }
Response: { 
  blueprint: { dimensions, materials, structural, specifications },
  buildingCodes: { ... }
}
```

### Fetch Building Codes
```
POST /api/building-codes/fetch
Body: { location: { city?, county?, state, zipCode? }, projectType?: string }
Response: { 
  codes: { structural, electrical, fireAndSafety, insulation, permits },
  location: { ... }
}
```

### 
### Generate Quote
```
POST /api/quotes/generate
Body: { materials: Material[], projectType: string, zipCode: string }
Response: { quote: { materials, totalCost, retailerPrices } }
```

## 🧪 Testing Without API Keys

The app includes mock data for testing without OpenAI API keys:
- Photo analysis returns sample measurements and material lists
- Price quotes use randomized pricing data
- No actual API calls are made

## 📦 Dependencies

### Mobile
- `expo` - React Native framework
- `expo-image-picker` - Camera/gallery access
- `react-native` - Mobile UI framework
Blueprint upload and analysis
- [x] Building code integration (AI-powered)
- [x] AI-powered photo
### Backend
- `next` - Full-stack React framework
- `openai` - OpenAI API client
- `react` - UI library

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for image analysis | MVP: No (uses mock data) |
| `DATABASE_URL` | PostgreSQL connection string | Future |
| `AWS_ACCESS_KEY_ID` | AWS S3 for photo storage | Future |
| `STRIPE_SECRET_KEY` | Stripe for contractor subscriptions | No (uses mock) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | No (uses mock) |
| `CONTRACTOR_TRIAL_DAYS` | Trial period (default: 30) | No |
| `CONTRACTOR_MONTHLY_PRICE` | Monthly price (default: 49.99) | No |

## 🗺️ Roadmap

### Phase 1: MVP ✅ (Current)
- [x] Project scaffolding
- [x] Photo upload functionality
- [x] AI-powered analysis
- [x] Mock price comparison

### Phase 2: Core Features
- [ ] Real price scraping from retailers
- [ ] User authentication (login/logout)
- [ ] Database integration (PostgreSQL)
- [ ] Stripe payment integration (live mode)
- [ ] Contractor dashboard with lead management
- [ ] Email notifications

### Phase 3: Advanced Features
- [ ] Permit requirements by location
- [ ] Contractor-homeowner matching
- [ ] Payment processing
- [ ] Review and rating system

### Phase 4: Production
- [ ] App Store submission (iOS)
- [ ] Google Play submission (Android)
- [ ] Production deployment
- [ ] Analytics and monitoring

## 📄 License

MIT

## 🤝 Contributing

This is a private project. For questions or suggestions, contact the development team.

## 📞 Support

For issues or questions:
1. Check the API documentation
2. Review environment configuration
3. Check logs in terminal

---

**Built with ❤️ for homeowners and contractors**
