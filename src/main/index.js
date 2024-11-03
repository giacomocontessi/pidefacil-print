const { app, shell, BrowserWindow, ipcMain, Menu } = require('electron');
const { join } = require('path');
const path = require('path');
const { electronApp, optimizer, is } = require('@electron-toolkit/utils');
const Store = require('electron-store');
const fs = require('fs');
const icon = path.join(__dirname, '../../resources/icon.png');
// const printer = require('printer');

// Import escpos modules
const escpos = require('escpos');
// For USB printers
escpos.USB = require('escpos-usb');
// For Network printers, you would use:
// const Network = require('escpos-network');

const store = new Store();
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    icon: icon,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      additionalPreloadScripts: [join(__dirname, '../preload/preload-electron-store.js')],
      sandbox: false,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();

    if (is.production) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  const menuTemplate = [
    {
      label: 'Herramientas',
      submenu: [
        {
          label: 'Mostrar Logs',
          click: () => {
            mainWindow.webContents.send('show-logs');
          },
        },
        {
          label: 'Acerca de',
          click: () => {
            mainWindow.webContents.send('show-terms');
          },
        },
        { type: 'separator' },
        {
          label: 'Cerrar Programa',
          role: 'quit',
        },
      ],
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  ipcMain.handle('get-printers', async () => {
    try {
      const printers = await mainWindow.webContents.getPrintersAsync();
      return printers;
    } catch (error) {
      return [];
    }
  });

  ipcMain.on('print-to-printer', async (event, { printerName, content, logoBase64 }) => {
    try {
      let printContent = content || '';

      if (logoBase64) {
        const buffer = Buffer.from(logoBase64.split(',')[1], 'base64');
        const bmpData = convertToBMP(buffer);
        printContent = bmpData + printContent;
      }

      const tempFilePath = join(app.getPath('temp'), 'print-output.txt');
      fs.writeFileSync(tempFilePath, printContent, 'binary');
      
      const printWindow = new BrowserWindow({ show: false });
      printWindow.loadFile(tempFilePath);
      printWindow.webContents.on('did-finish-load', () => {
        printWindow.webContents.print({
          silent: true,
          deviceName: printerName,
        }, () => {
          printWindow.close();
        });
      });
    } catch (error) {
      console.error('Failed to handle print request:', error);
    }
  });

  function convertToBMP(buffer) {
    return buffer.toString('binary');
  }

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('store-get', (event, key) => {
    const value = store.get(key);
    return value;
  });

  ipcMain.handle('store-set', (event, key, value) => {
    store.set(key, value);
  });

  ipcMain.handle('store-delete', (event, key) => {
    store.delete(key);
  });

  ipcMain.handle('get-logs', () => {
    console.log('read logs placeholder');
  });

// Method 2: Thermal Printer (Using node-thermal-printer)
ipcMain.on('print-to-printer-thermal', async (event, { printerName, data }) => {
  try {
    console.log('About to start printing using the printer module');

    // Prepare the raw ESC/POS commands as a Buffer
    let commandsArray = [];

    data.forEach((item) => {
      switch (item.type) {
        case 'text':
          // Start with initializing printer and setting default styles
          commandsArray.push(Buffer.from('\x1B\x40')); // Initialize printer
          
          // Set alignment
          if (item.style && item.style.textAlign) {
            if (item.style.textAlign === 'center') {
              commandsArray.push(Buffer.from('\x1B\x61\x01')); // Center alignment
            } else if (item.style.textAlign === 'right') {
              commandsArray.push(Buffer.from('\x1B\x61\x02')); // Right alignment
            } else {
              commandsArray.push(Buffer.from('\x1B\x61\x00')); // Left alignment
            }
          }

          // Set bold
          if (item.style && item.style.fontWeight === '700') {
            commandsArray.push(Buffer.from('\x1B\x45\x01')); // Bold on
          } else {
            commandsArray.push(Buffer.from('\x1B\x45\x00')); // Bold off
          }

          // Set font size
          if (item.style && item.style.fontSize) {
            const size = parseInt(item.style.fontSize);
            const sizeCommand = size === 2 ? '\x1D\x21\x11' : '\x1D\x21\x00'; // Double size or normal
            commandsArray.push(Buffer.from(sizeCommand));
          } else {
            commandsArray.push(Buffer.from('\x1D\x21\x00')); // Normal size
          }

          // Add the text
          commandsArray.push(Buffer.from(item.value + '\n', 'utf8'));

          // Reset styles
          commandsArray.push(Buffer.from('\x1B\x61\x00')); // Left alignment
          commandsArray.push(Buffer.from('\x1B\x45\x00')); // Bold off
          commandsArray.push(Buffer.from('\x1D\x21\x00')); // Normal size
          break;

        // Handle other types like 'qrCode', 'image' if needed
        default:
          console.error(`Unknown item type: ${item.type}`);
      }
    });

    // Add cut command at the end
    commandsArray.push(Buffer.from('\x1D\x56\x41')); // Cut paper

    // Concatenate all buffers
    const commandsBuffer = Buffer.concat(commandsArray);

    // Send the raw commands to the printer
    // printer.printDirect({
    //   data: commandsBuffer,
    //   printer: printerName,
    //   type: 'RAW',
    //   success: function (jobID) {
    //     console.log('Printed with job ID: ' + jobID);
    //     event.reply('print-response', { success: true });
    //   },
    //   error: function (err) {
    //     console.error('Error printing:', err);
    //     event.reply('print-response', { success: false, error: err.message });
    //   },
    // });
  } catch (error) {
    console.error('Failed to print ticket:', error);
    event.reply('print-response', { success: false, error: error.message });
  }
});
  
}  

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})
