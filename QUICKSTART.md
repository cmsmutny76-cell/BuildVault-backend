# Quick Start Guide

## 🎯 What We Built

A cross-platform construction lead generation app with:
- **Mobile app** (React Native/Expo) for iOS, Android, and web
- **Backend API** (Next.js) with AI-powered features
- **Photo analysis** - Estimate materials from photos
- **Blueprint analysis** - Professional measurements from drawings
- **Building code integration** - Auto-check local requirements
- **Price comparison** - Compare Home Depot, Lowes, Ace Hardware

## 📂 Project Structure

```
construction-lead-app/
├── .github/
│   └── copilot-instructions.md
├── mobile/                          # React Native app
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Main dashboard
│   │   ├── PhotoUploadScreen.tsx   # Photo analysis
│   │   └── BlueprintUploadScreen.tsx # Blueprint analysis
│   ├── App.tsx
│   └── package.json
├── backend/                         # Next.js API
│   ├── app/api/
│   │   ├── photos/upload/          # Photo uploads
│   │   ├── ai/
│   │   │   ├── analyze-photo/      # Photo AI analysis
│   │   │   └── analyze-blueprint/  # Blueprint AI analysis
│   │   ├── building-codes/fetch/   # Code requirements
│   │   └── quotes/generate/        # Price quotes
│   └── package.json
├── database/
│   └── schema.sql                  # PostgreSQL schema
├── README.md
├── BLUEPRINT_FEATURES.md
└── package.json

```

## ⚡ Quick Start

### 1. Environment Setup (Optional)

Create `backend/.env` file:
```bash
OPENAI_API_KEY=your_key_here
```

> **Note:** App works with mock data if no API key is provided!

### 2. Start Backend API

```powershell
npm run backend
# or
cd backend
npm run dev
```

**Backend runs on:** http://localhost:3000

### 3. Start Mobile App

**In a new terminal:**
```powershell
npm run mobile
# or
cd mobile
npm start
```

Then choose:
- Press **`w`** - Open in web browser (easiest!)
- Press **`a`** - Android emulator
- Press **`i`** - iOS simulator (Mac only)
- **Scan QR** - Expo Go app on your phone

## 🎨 Features to Try

### 1. Photo Analysis
1. Open app → Photo Upload Screen
2. Take photo or choose from gallery
3. Click "Analyze Photo"
4. Get materials list, measurements, recommendations

### 2. Blueprint Analysis ⭐ NEW
1. Open app → Blueprint Upload Screen
2. Upload construction blueprint/drawing
3. Enter project location (city, state, ZIP)
4. Click "Analyze Blueprint"
5. Get:
   - Precise measurements from drawing
   - Complete materials list by category
   - Building code requirements
   - Required hardware (hurricane ties, GFCI outlets, etc.)
   - Permit information

### 3. Building Codes Integration ⭐ NEW
- Automatically fetches code requirements based on location
- Identifies additional hardware needed for compliance
- Shows permit requirements

## 🧪 Test Without API Keys

The app includes comprehensive mock data:
- ✅ Photo analysis returns sample results
- ✅ Blueprint analysis shows detailed material lists
- ✅ Building codes provide example requirements
- ✅ Price quotes use realistic mock pricing

**Everything works without configuration!**

## 📱 Mobile Screens

| Screen | Purpose |
|--------|---------|
| **Home** | Dashboard, feature overview |
| **Photo Upload** | Quick photo analysis for simple projects |
| **Blueprint Upload** | Professional blueprint analysis with code compliance |

## 🔌 API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/photos/upload` | Upload photos/blueprints |
| `POST /api/ai/analyze-photo` | Analyze construction photos |
| `POST /api/ai/analyze-blueprint` | Analyze blueprints/drawings |
| `POST /api/building-codes/fetch` | Get local code requirements |
| `POST /api/quotes/generate` | Generate price quotes |

## 🔧 Troubleshooting

### Backend won't start
```powershell
cd backend
npm install
npm run dev
```

### Mobile won't start
```powershell
cd mobile
npm install
npm start
```

### Can't run npm commands
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
```

## 📝 What's Next?

### Immediate TODOs:
- [ ] Test photo upload
- [ ] Test blueprint upload
- [ ] Try with different locations for building codes

### Future Features:
- Real price scraping from retailers
- User authentication
- Database integration
- Contractor matching
- Payment processing
- App Store deployment

## 🎓 Learning Resources

**React Native:** https://reactnative.dev/
**Expo:** https://docs.expo.dev/
**Next.js:** https://nextjs.org/docs
**OpenAI API:** https://platform.openai.com/docs

## 💬 Need Help?

1. Check [README.md](README.md) for detailed docs
2. Review [BLUEPRINT_FEATURES.md](BLUEPRINT_FEATURES.md) for new features
3. Check terminal output for errors
4. Verify environment variables in `.env`

## 🚀 You're Ready!

Run these commands to start development:

```powershell
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Mobile
npm run mobile
```

**Then press `w` in the Expo terminal to open in your browser!**

---

**Happy building! 🏗️**
