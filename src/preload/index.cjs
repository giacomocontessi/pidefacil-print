const { contextBridge, ipcRenderer } = require('electron');
const { Buffer } = require('buffer');

contextBridge.exposeInMainWorld('electron', {
  getAvailablePrinters: async () => {
    try {
      const printers = await ipcRenderer.invoke('get-printers');
      return printers;
    } catch (error) {
      console.error('Failed to get printers:', error);
      return [];
    }
  },
  printToPrinter: (printerName, content, logoBase64) => {
    ipcRenderer.send('print-to-printer', { printerName, content, logoBase64 });
  },
  printToPrinterThermal: (printerName, data) => {
    // Send a request to the main process to handle thermal printing
    ipcRenderer.send('print-to-printer-thermal', { printerName, data });
  },
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key),
  },
  getLogs: async () => {
    try {
      const logs = await ipcRenderer.invoke('get-logs');
      return logs;
    } catch (error) {
      console.error('Failed to get logs:', error);
      return 'Failed to load logs.';
    }
  },
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => {
      const subscription = (event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once: (channel, func) => {
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    },
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  },
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  printLogo: (logoBase64) => ipcRenderer.invoke('print-logo', logoBase64),
  convertBase64ToBuffer: (base64String) => {
    try {
      const buffer = Buffer.from(base64String.split(',')[1], 'base64');
      return buffer.toString('binary');
    } catch (error) {
      console.error('Failed to convert base64 to buffer:', error);
      return null;
    }
  }
});
