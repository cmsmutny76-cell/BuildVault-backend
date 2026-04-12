# 🎨 BuildVault Google Play Store Graphics Guide

**Date:** March 20, 2026  
**Purpose:** Complete guide to creating all required Google Play Store graphics

---

## ✅ What You Already Have

Your app icon is ready to use:
- **Location:** `mobile/assets/play-store-icon-512.png`
- **Size:** 512 x 512 px ✅
- **Status:** Ready to upload to Google Play Console

---

## 📋 Required Graphics Checklist

| Graphic | Size | Quantity | Status |
|---------|------|----------|--------|
| **App Icon** | 512 x 512 px | 1 | ✅ Ready (`mobile/assets/play-store-icon-512.png`) |
| **Feature Graphic** | 1024 x 500 px | 1 | ❌ Need to create |
| **Phone Screenshots** | 1080 x 1920 px (min) | 2-8 | ❌ Need to capture |
| **Tablet Screenshots** | 1920 x 1200 px (optional) | 2-8 | ⚠️ Optional |

---

## 🎨 OPTION 1: Quick & Easy with Canva (Recommended)

### **Step 1: Create Feature Graphic (1024 x 500 px)**

1. **Go to:** https://www.canva.com (free account)
2. **Click:** "Create a design" → "Custom size"
3. **Enter:** 1024 x 500 pixels
4. **Design Suggestions:**

**BuildVault Feature Graphic Template:**

```
Background: Construction theme
- Orange/yellow gradient (#FF6B35 to #F7931E)
- Or deep blue (#1E3A8A to #3B82F6)

Left Side (400px):
- BuildVault logo/icon
- App name: "BuildVault" (bold, 72pt)
- Tagline: "Your Construction Command Center" (24pt)

Right Side (624px):
- 3 phone mockups showing app screens:
  1. AI Photo Analysis screen
  2. Contractor Matching screen
  3. Project Dashboard

Bottom Banner:
- "AI-Powered Contractor Matching" icon
- "Secure Payments" icon
- "Project Management" icon
```

5. **Export:** PNG format, 1024 x 500 px

**Canva Template Search Terms:**
- "App feature graphic"
- "Mobile app banner"
- "Play Store feature graphic"

---

### **Step 2: Create Screenshots**

**Method A: From Running App (Best)**

1. **Run your app:**
   ```bash
   cd C:\Users\Public\construction-lead-app\mobile
   npx expo start
   ```

2. **Open in Expo Go on Android device**

3. **Capture these screens (press Power + Volume Down):**
   - ✅ Login/Welcome screen
   - ✅ Home screen with project selection
   - ✅ AI Photo Analysis result
   - ✅ Contractor matching with scores
   - ✅ Project dashboard with timeline
   - ✅ Chat/messaging screen
   - ✅ Estimate/quote details
   - ✅ Contractor profile

4. **Transfer screenshots to computer:**
   - Connect phone via USB
   - Copy from `DCIM/Screenshots/` folder

**Method B: Using Expo Screenshots (If App Not Running)**

1. **Install screenshot tool:**
   ```bash
   npm install -g expo-cli
   ```

2. **Generate screenshots from Expo:**
   ```bash
   cd mobile
   npx expo export:web
   # Open in browser and use browser dev tools to simulate mobile
   # Take screenshots with browser screenshot extension
   ```

**Method C: Use Mockup Generator (Fastest)**

1. **Go to:** https://mockuphone.com or https://shots.so
2. **Upload screenshots** (any size)
3. **Select device:** Android phone (Pixel 6, Samsung Galaxy, etc.)
4. **Download** perfectly sized screenshots with device frame

---

## 🎨 OPTION 2: DIY with PowerPoint/Google Slides

### **Feature Graphic (1024 x 500 px)**

1. **Open PowerPoint or Google Slides**
2. **Create custom slide:**
   - File → Page Setup → Custom → 10.24" x 5" (or 26cm x 13cm)
3. **Design layout:**
   - Background: Solid color or gradient (construction theme)
   - Text: "BuildVault" (large, bold)
   - Subtext: "Your Construction Command Center"
   - Icons: Construction hard hat, AI chip, handshake
4. **Export:**
   - File → Export → PNG
   - Select "High Quality (300 DPI)"

### **Screenshots with Device Frames**

1. **Go to:** https://smartmockups.com (free)
2. **Upload your plain screenshots**
3. **Select device:** Android phone
4. **Download** with device frame (perfect for Play Store)

---

## 🎨 OPTION 3: Professional Designer (If You Have Budget)

**Quick Turnaround Options:**
- **Fiverr:** $5-$25 (search "google play store graphics")
- **Upwork:** $50-$150 (1-2 day turnaround)
- **99designs:** $299+ (contest with multiple designers)

**What to Provide Designer:**
1. BuildVault logo (from `mobile/assets/icon.png`)
2. Brand colors: 
   - Primary: Orange (#FF6B35)
   - Secondary: Blue (#3B82F6)
   - Accent: Yellow (#F7931E)
3. Tagline: "Your Construction Command Center"
4. Key features: AI matching, secure payments, project management
5. Screenshots from your app (if available)

---

## 📏 Exact Specifications (Google Play Requirements)

### **App Icon**
- **Size:** 512 x 512 px ✅ (You already have this)
- **Format:** 32-bit PNG with alpha
- **File size:** Max 1 MB
- **Shape:** Full square (Google adds rounded corners)

### **Feature Graphic**
- **Size:** 1024 x 500 px (EXACTLY)
- **Format:** JPEG or 24-bit PNG (no alpha)
- **File size:** Max 1 MB
- **Used:** Top of store listing, banners, promotions
- **Critical:** This is the first thing users see!

### **Phone Screenshots**
- **Min size:** 320 px on short edge
- **Max size:** 3840 px on long edge
- **Recommended:** 1080 x 1920 px (portrait) or 1920 x 1080 px (landscape)
- **Format:** JPEG or 24-bit PNG
- **Quantity:** 2 minimum, 8 maximum
- **Best practice:** Use 6-8 screenshots showing key features

### **Tablet Screenshots (Optional but Recommended)**
- **Size:** 1920 x 1200 px or 2560 x 1600 px
- **Format:** Same as phone
- **Quantity:** 2-8
- **Note:** Shows you support tablets (increased trust)

---

## 🎯 Screenshot Best Practices

### **What to Show (In Order):**

1. **Welcome/Login Screen** - First impression
2. **Home Dashboard** - Show project overview
3. **AI Photo Analysis** - Highlight AI feature (killer feature!)
4. **Contractor Matching** - Show match scores (unique selling point)
5. **Project Details** - Timeline, milestones, photos
6. **Messaging** - Communication feature
7. **Estimate/Quote** - Pricing transparency
8. **Contractor Profile** - Trust & verification

### **Screenshot Tips:**
- ✅ Show real data (not "Lorem Ipsum" or placeholder text)
- ✅ Use consistent branding colors
- ✅ Add text overlays explaining features (optional but effective)
- ✅ Show the app in action (not empty states)
- ✅ Use portrait orientation (easier to view on mobile)
- ❌ Don't show bugs, errors, or loading states
- ❌ Don't include personal information
- ❌ Don't use copyrighted images (use stock photos if needed)

---

## 🚀 Quick Start: 30-Minute Solution

**If you need graphics RIGHT NOW:**

1. **App Icon:** ✅ Already done (`mobile/assets/play-store-icon-512.png`)

2. **Feature Graphic (10 minutes):**
   - Go to Canva.com (free)
   - Search "Google Play Feature Graphic"
   - Customize with:
     - Text: "BuildVault - Your Construction Command Center"
     - Colors: Orange/Blue
     - Icon: Construction/Building theme
   - Download as PNG

3. **Screenshots (20 minutes):**
   - Method A: Run app and screenshot 4-6 key screens
   - Method B: Go to mockuphone.com, upload simple screenshots
   - Method C: Use placeholder screenshots from similar apps (ONLY for testing, replace before public launch)

---

## 📱 Screenshot Shortcut: Use Android Emulator

If your app isn't fully functional yet:

1. **Open Android Studio**
2. **Start emulator:**
   ```bash
   cd mobile
   npm run android
   ```
3. **Navigate through app** and capture screenshots
4. **Screenshot in emulator:** Click camera icon in emulator toolbar
5. **Screenshots save to:** `%USERPROFILE%\AppData\Local\Android\Sdk\platforms\android-XX\screenshots\`

---

## 🎨 BuildVault Design Guidelines

### **Brand Colors:**
- **Primary Orange:** #FF6B35 (energy, construction, action)
- **Deep Blue:** #1E3A8A (trust, professional, secure)
- **Accent Yellow:** #F7931E (optimism, caution tape reference)
- **Dark Gray:** #374151 (text, stability)
- **Light Gray:** #F3F4F6 (backgrounds)

### **Typography:**
- **Headlines:** Bold, sans-serif (Montserrat, Poppins, Inter)
- **Body:** Regular, readable (Open Sans, Roboto, Inter)

### **Imagery:**
- Construction themes (hard hats, tools, blueprints)
- Modern, clean, professional
- Real construction photos (not cartoon/clipart)
- People working together (homeowners + contractors)

### **Tone:**
- Professional but approachable
- Trustworthy and secure
- Innovation and technology
- Empowerment and control

---

## ✅ Upload Checklist

Before uploading to Google Play Console:

- [ ] App icon is 512 x 512 px PNG
- [ ] Feature graphic is EXACTLY 1024 x 500 px
- [ ] Feature graphic file size under 1 MB
- [ ] At least 2 phone screenshots (recommend 6-8)
- [ ] Screenshots show real app functionality
- [ ] No personal information visible in screenshots
- [ ] All graphics are high quality (no pixelation)
- [ ] Graphics match BuildVault brand colors and style
- [ ] Text is readable on mobile devices

---

## 🎯 Next Steps

1. **Choose your method** (Option 1, 2, or 3 above)
2. **Create feature graphic first** (1024 x 500 px)
3. **Capture/create screenshots** (at least 2, recommend 6)
4. **Save all graphics in:** `C:\Users\Public\construction-lead-app\mobile\play-store-assets\`
5. **Upload to Google Play Console**

---

## 🆘 Need Help?

**Stuck on graphics?** 
- Ask me to walk you through Canva step-by-step
- I can provide more specific design instructions
- I can help you write text overlays for screenshots

**Questions about dimensions or formats?**
- Google Play Console will validate on upload
- If rejected, it will tell you exactly what's wrong

**App not running for screenshots?**
- We can use mockups or placeholder images for initial submission
- Update with real screenshots before public launch

---

## 📎 Resources

- **Canva:** https://www.canva.com (feature graphics)
- **Mockuphone:** https://mockuphone.com (screenshot frames)
- **Smartmockups:** https://smartmockups.com (device mockups)
- **Google Play Asset Guidelines:** https://support.google.com/googleplay/android-developer/answer/9866151
- **Icon generators:** https://easyappicon.com (if you need to recreate icon)

---

**Status:** Ready to create graphics and continue Google Play Store setup! 🎨
