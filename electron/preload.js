const { contextBridge, ipcRenderer } = require('electron');

/**
 * Securely expose specific APIs to the Renderer process.
 * We do not expose the entire Node.js 'process' or 'require' for security.
 */
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  // Add version info if needed
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  }
});