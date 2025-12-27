/**
 * ELECTRON MAIN PROCESS
 * 
 * To build for Windows:
 * 1. Install dependencies: `npm install --save-dev electron electron-builder`
 * 2. Add to package.json: "main": "electron/main.js"
 * 3. Add script: "electron:start": "electron ."
 * 4. Add script: "electron:build": "electron-builder --win"
 * 
 * Note: Ensure process.env.API_KEY is available during the web build process.
 */

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    title: 'FraudShield AI',
    backgroundColor: '#09090b', // Matches the app's dark theme
    // icon: path.join(__dirname, '../public/icon.png'), // Expects an icon if available
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true
    },
    autoHideMenuBar: true,
  });

  // Load the application
  // Priority 1: 'dist/index.html' (Production Build)
  // Priority 2: 'index.html' (Root fallback)
  const distPath = path.join(__dirname, '../dist/index.html');
  const rootPath = path.join(__dirname, '../index.html');

  if (fs.existsSync(distPath)) {
    win.loadFile(distPath);
  } else {
    // Development / Direct Load
    // If you are running a dev server (e.g. Vite on port 5173), un-comment below:
    // win.loadURL('http://localhost:5173');
    win.loadFile(rootPath);
  }

  // Handle external links (e.g. Google Search Results)
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
};

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