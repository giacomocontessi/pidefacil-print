import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import Store from 'electron-store';
import fs from 'fs';
import { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } from 'node-thermal-printer';
import icon from '../../resources/icon.png'
const electron = typeof process !== 'undefined' && process.versions && !!process.versions.electron;

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
// Method 2: Thermal Printer (Using node-thermal-printer)
ipcMain.on('print-to-printer-thermal', async (event, { printerName, data }) => {
  try {
    console.log('About to start ThermalPrinter function on index.js');
    
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON, // Replace with your printer type (e.g., STAR, EPSON, etc.)
      interface: `printer:${printerName}`,
      characterSet: CharacterSet.PC852_LATIN2, // Set a common character set explicitly
      removeSpecialCharacters: false, // Set to true or false based on your needs
      lineCharacter: "=",
      breakLine: BreakLine.WORD,
      options: {
        timeout: 5000,  // Connection timeout (optional)
      },
      driver: require(electron ? 'electron-printer' : 'printer')
      // driver: 'printer'
    });

    // Use for...of loop to process each item in the data array
    for (const item of data) {
      switch (item.type) {
        case 'text':
          printer.setTextNormal(); // Reset to normal text
          if (item.style) {
            if (item.style.fontWeight === '700') {
              printer.bold(true); // Set text to bold
            }
            if (item.style.textAlign) {
              if (item.style.textAlign === 'center') {
                printer.alignCenter();
              } else if (item.style.textAlign === 'left') {
                printer.alignLeft();
              } else if (item.style.textAlign === 'right') {
                printer.alignRight();
              }
            }
            if (item.style.fontSize) {
              const size = parseInt(item.style.fontSize);
              if (!isNaN(size)) {
                printer.setTextSize(size, size); // Set the font size
              }
            }
          }
          printer.println(item.value);
          printer.bold(false); // Reset bold after printing
          break;

        case 'qrCode':
          printer.printQR(item.value, { size: item.size || 4, correction: 'M' });
          break;

        case 'image':
          await printer.printImage(item.value); // item.value should be the path to the image
          break;

        // Add other cases as needed, like 'barCode', 'table', etc.

        default:
          console.error(`Unknown item type: ${item.type}`);
      }
    }

    printer.cut();
    await printer.execute();
    event.reply('print-response', { success: true });
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
