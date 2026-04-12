# 📱 Installing Your New BuildVault Logo

## Step 1: Save Your Logo Files

You need to save your logo image in these locations:

### Required Files:

1. **App Icon** (1024 x 1024 px)
   - Save your logo as: `C:\Users\Public\construction-lead-app\mobile\assets\icon.png`
   - This is the main app icon

2. **Adaptive Icon** (1024 x 1024 px)
   - Save your logo as: `C:\Users\Public\construction-lead-app\mobile\assets\adaptive-icon.png`
   - This is for Android adaptive icons (background layer)

3. **Play Store Icon** (512 x 512 px)
   - Save your logo as: `C:\Users\Public\construction-lead-app\mobile\assets\play-store-icon-512.png`
   - This is for Google Play Console

4. **Splash Screen Icon** (1200 x 1200 px recommended)
   - Save your logo as: `C:\Users\Public\construction-lead-app\mobile\assets\splash-icon.png`
   - This appears on the splash screen when app launches

## Step 2: Replace the Files

**Option A: Manual Copy**
1. Right-click your logo file
2. Copy it
3. Navigate to `C:\Users\Public\construction-lead-app\mobile\assets\`
4. Paste and rename to each filename above (overwrite existing files)

**Option B: Using PowerShell** (if all logos are the same file)
```powershell
cd "C:\Users\Public\construction-lead-app\mobile\assets"

# Replace with your logo file path
$yourLogo = "C:\Users\Downloads\buildvault-logo.png"

# Copy to all required locations
Copy-Item $yourLogo "icon.png" -Force
Copy-Item $yourLogo "adaptive-icon.png" -Force
Copy-Item $yourLogo "play-store-icon-512.png" -Force
Copy-Item $yourLogo "splash-icon.png" -Force
```

## Step 3: Test in App

### Option A: Test with Expo Go (Fastest - 2 minutes)
```bash
cd C:\Users\Public\construction-lead-app\mobile
npx expo start
```
Then:
1. Open Expo Go app on your phone
2. Scan the QR code
3. App will load with new icon on splash screen

### Option B: Build Development APK (30 minutes)
```bash
cd C:\Users\Public\construction-lead-app\mobile
eas build --platform android --profile development
```
This creates an installable APK with your new icon.

### Option C: Full Production Build (for Play Store)
```bash
cd C:\Users\Public\construction-lead-app\mobile
eas build --platform android --profile production
```
This creates the final AAB file for Google Play Store submission.

## Step 4: Verify Icon Appears

After loading/installing:
- ✅ Check splash screen shows new logo
- ✅ Check app launcher shows new icon
- ✅ Check home screen icon looks good at small size

## Current Icon Sizes:

Your existing icons:
- `icon.png` - 22 KB (1024x1024)
- `adaptive-icon.png` - 17 KB (1024x1024)
- `play-store-icon-512.png` - 40 KB (512x512)
- `splash-icon.png` - 17 KB (1024x1024)

Replace these with your new logo files!

---

**Ready to test?** Save your logo files, then let me know and I'll help you run the app!
