# Blueprint & Building Code Features

## 🆕 New Capabilities Added

### 1. Blueprint/Drawing Upload and Analysis
The app now supports uploading architectural blueprints and construction drawings for highly accurate material estimation.

**Features:**
- Upload blueprint images from gallery
- AI extracts precise dimensions from drawings
- Complete material breakdown by category:
  - Framing lumber (detailed counts)
  - Drywall/sheetrock (square footage)
  - Electrical components
  - Plumbing fixtures
  - Flooring materials
  - Insulation requirements
- Structural element identification
- Specification extraction

**API Endpoint:**
```
POST /api/ai/analyze-blueprint
Body: {
  blueprintUrl: string,
  location?: { city, county, state, zipCode }
}
```

### 2. Building Code Integration
AI automatically fetches and analyzes building codes for your project location (city/county/state).

**What it checks:**
- **Structural requirements**: Hurricane ties, anchor bolts, seismic fasteners
- **Electrical codes**: GFCI outlets, AFCI breakers, outlet spacing
- **Fire safety**: Smoke detectors, CO detectors, fire-rated materials
- **Insulation requirements**: R-values by climate zone
- **Permit requirements**: Required permits and estimated costs

**Additional Hardware Identification:**
The AI identifies code-mandated hardware that must be purchased:
- Hurricane ties and connectors
- Foundation anchor bolts
- Joist hangers
- GFCI and AFCI outlets
- Tamper-resistant receptacles
- Smoke and CO detectors
- Insulation baffles
- Vapor barriers

**API Endpoint:**
```
POST /api/building-codes/fetch
Body: {
  location: { city?, county?, state, zipCode? },
  projectType?: string
}
```

### 3. Combined Analysis
When you upload a blueprint with location data, the app:
1. Analyzes the blueprint for materials
2. Fetches local building codes
3. Adds code-required hardware to the materials list
4. Provides permit information
5. Generates a compliance-ready quote

## 📱 New Mobile Screen

**BlueprintUploadScreen.tsx**
- Clean interface for blueprint upload
- Optional location form for code checking
- Detailed analysis display with categorized materials
- Building code requirements with specific hardware callouts
- Color-coded sections (green for blueprints, yellow for codes)

## 🗄️ Database Updates

New tables added:
- `blueprints` - Stores blueprint analyses
- `building_codes` - Caches code requirements by location

Updated tables:
- `project_photos` - Now supports blueprint type

## 🎯 How It Works

1. **Homeowner uploads blueprint** → Photo/gallery picker
2. **Enters project location** → City, county, state, ZIP
3. **AI analyzes blueprint** → OpenAI GPT-4o Vision extracts measurements
4. **AI fetches building codes** → Queries code requirements for location
5. **Generates materials list** → Combines blueprint + code requirements
6. **Adds required hardware** → Hurricane ties, GFCI outlets, etc.
7. **Ready for quote** → Complete, code-compliant materials list

## 💡 Example Output

```
BLUEPRINT ANALYSIS:
- Dimensions: 40ft x 30ft, 1200 sqft
- 2x4 Studs: 120 pieces
- Drywall: 65 sheets
- Outlets: 24 units

BUILDING CODES (Miami, FL):
- Hurricane ties required (120 units)
- GFCI outlets in kitchen/bath (8 units)
- R-30 insulation for ceiling
- Foundation anchors every 6ft

TOTAL MATERIALS:
- All blueprint materials
- + Code-required hardware
- = Complete shopping list
```

## 🚀 Next Steps

To use this feature:
1. Start the backend: `npm run backend`
2. Start mobile app: `npm run mobile`
3. Navigate to Blueprint Upload screen
4. Upload a construction drawing
5. Add project location
6. Get detailed, code-compliant materials list!

## 🔑 API Keys Needed

- `OPENAI_API_KEY` - For blueprint and code analysis
- Works with mock data if not configured

---

**This makes the app a professional-grade estimation tool for contractors and homeowners!**
