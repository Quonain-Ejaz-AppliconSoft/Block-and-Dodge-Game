# Converting Block Dodger to an Electron Desktop App

You can convert this React web application into a standalone desktop application using Electron.

## 1. Prerequisites
Ensure you have Node.js installed.

## 2. Install Electron
In your project root, run:
```bash
npm install --save-dev electron
```

## 3. Create Electron Entry Point
Create a file named `main.js` in your project root:

```javascript
// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
    },
    autoHideMenuBar: true,
    backgroundColor: '#0f172a',
    title: "Block Dodger"
  });

  // In development, you might load localhost if running the react dev server
  // win.loadURL('http://localhost:3000'); 
  
  // For production build:
  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

## 4. Update package.json
Modify your `package.json` to include the main entry point and start script.

```json
{
  "name": "block-dodger-electron",
  "version": "1.0.0",
  "main": "main.js", 
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "electron:start": "electron ."
  },
  // ... rest of dependencies
}
```

## 5. Running the App
1. **Build the React App**:
   ```bash
   npm run build
   ```
   *Note: Ensure your `vite.config.ts` or `webpack` config outputs to `dist` and uses relative paths (`base: './'`) so Electron can find the assets.*

2. **Start Electron**:
   ```bash
   npm run electron:start
   ```

The game window should now open as a desktop application!