# Construction Background Image Options

Choose from these free, high-quality construction-themed backgrounds similar to your reference image:

## Option 1: Blueprint with Pencils & Tools (Currently Active - Edited)
- **URL**: `https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80&blur=2`
- **Theme**: Blueprint with drafting tools
- **Colors**: Blue tones with construction imagery
- **Edits Applied**: 
  - Slight blur filter (blur=2) to obscure any logos
  - 15% zoom (scale: 1.15) to crop out edges
  - Increased dark overlay (88% opacity) for better logo concealment

## Option 2: Architectural Blueprint with Buildings
- **URL**: `https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=1200`
- **Theme**: Hand-drawn blueprint with technical details
- **Colors**: Blue blueprint background

## Option 3: Modern Architecture Planning
- **URL**: `https://images.pexels.com/photos/4458205/pexels-photo-4458205.jpeg?auto=compress&cs=tinysrgb&w=1200`
- **Theme**: Floor plan and architectural design
- **Colors**: Professional white and blue

## Option 4: Blueprint with Pencils & Measuring Tools  
- **URL**: `https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80`
- **Theme**: Blueprint with pencils and tools (note: may have small logos visible)
- **Colors**: Warm construction site tones

## Option 5: Blueprint Grid Background
- **URL**: `https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&q=80`
- **Theme**: Technical blueprint grid pattern  
- **Colors**: Classic blue blueprint

## How to Change the Background

1. Open `mobile/screens/HomeScreen.tsx`
2. Find line ~173 with `source={{ uri: '...' }}`
3. Replace the URL with your chosen option
4. Save and the app will hot-reload

Example:
```tsx
<ImageBackground
  source={{ uri: 'YOUR_CHOSEN_URL_HERE' }}
  style={styles.backgroundImage}
  resizeMode="cover"
>
```

## Custom Image from Your Computer

To use your own image:

1. Place your image in `mobile/assets/` folder (e.g., `construction-bg.jpg`)
2. Update the source:
```tsx
<ImageBackground
  source={require('../assets/construction-bg.jpg')}
  style={styles.backgroundImage}
  resizeMode="cover"
>
```

## Adjusting Overlay Darkness

In `HomeScreen.tsx` styles, adjust the overlay opacity:
- Current: `backgroundColor: 'rgba(15, 23, 42, 0.85)'` (85% dark)
- Lighter: `backgroundColor: 'rgba(15, 23, 42, 0.7)'` (70% dark)
- Darker: `backgroundColor: 'rgba(15, 23, 42, 0.95)'` (95% dark)

## Creating Your Own Composite Image

To create a custom background like your reference:
1. Use Canva or Photoshop to combine:
   - Blueprint background
   - Building/construction images
   - Rolled blueprints overlay
2. Export as JPG at 1920x1080 or higher
3. Upload to a free image host or use locally
4. Update the source URL

All images listed are from Unsplash/Pexels (free for commercial use).
