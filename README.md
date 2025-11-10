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

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and animations
- `script.js` - Touch detection and game logic
- `package.json` - NPM configuration for local development

## Testing

For best testing experience:
- Use a mobile device or browser's device emulation mode
- Test with multiple simultaneous touches
- Ensure touch events are working properly

