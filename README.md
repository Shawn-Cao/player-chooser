# Player Chooser

A client-side web app for randomly choosing a player when multiple people touch the screen simultaneously.

## Features

- Full-screen touch interface optimized for mobile devices
- Detects multiple simultaneous touches
- 2-second countdown before random selection
- Visual effects and animations
- Works offline (client-side only)

## Local Development

1. Install dependencies (optional - uses npx):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

   This will start a local server on `http://localhost:8080` and automatically open it in your browser.

   For testing on mobile devices, you can access it via your local network IP (e.g., `http://192.168.1.x:8080`).

## GitHub Pages Deployment

1. Push all files to your GitHub repository
2. Go to repository Settings → Pages
3. Select your branch (usually `main` or `master`)
4. Select `/ (root)` as the source
5. Your app will be available at `https://<username>.github.io/player-chooser/`

## PWA Setup

This app is a Progressive Web App (PWA) that can be installed on mobile devices via "Add to Home Screen". The required icon files (`icon-192.png` and `icon-512.png`) are included in the repository.

To regenerate icons (if needed):
1. Open `generate-icons-simple.html` in your browser
2. Download the generated icon files
3. Replace the existing icon files in the root directory

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and animations
- `script.js` - Touch detection and game logic
- `manifest.json` - PWA manifest file
- `service-worker.js` - Service worker for offline support
- `package.json` - NPM configuration for local development
- `generate-icons-simple.html` - Browser-based icon generator (no dependencies)

## Testing

For best testing experience:
- Use a mobile device or browser's device emulation mode
- Test with multiple simultaneous touches
- Ensure touch events are working properly

