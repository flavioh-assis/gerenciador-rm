import path from 'path';
import { app, BrowserWindow, crashReporter, Menu, protocol } from 'electron';
require('../api/main');

const isDevelopment = process.env.NODE_ENV === 'development';

let mainWindow = null;
let forceQuit = false;

crashReporter.start({
  productName: 'Flavio Assis',
  companyName: 'Flavio Assis',
  submitURL: 'https://your-domain.com/url-to-submit',
  uploadToServer: false,
});

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  mainWindow = new BrowserWindow({
    minWidth: 1160,
    minHeight: 760,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: true,
    },
  });

  mainWindow.loadFile(path.resolve(path.join(__dirname, '../renderer/index.html')));

  // show window once on first load
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.show();

    if (isDevelopment) {
      // auto-open dev tools
      // mainWindow.webContents.openDevTools();

      // add inspect element on right click menu
      mainWindow.webContents.on('context-menu', (e, props) => {
        Menu.buildFromTemplate([
          {
            label: 'Inspect element',
            click() {
              mainWindow.inspectElement(props.x, props.y);
            },
          },
        ]).popup(mainWindow);
      });
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    // Handle window logic properly on macOS:
    // 1. App should not terminate if window has been closed
    // 2. Click on icon in dock should re-open the window
    // 3. ⌘+Q should close the window and quit the app
    if (process.platform === 'darwin') {
      mainWindow.on('close', function (e) {
        if (!forceQuit) {
          e.preventDefault();
          mainWindow.hide();
        }
      });

      app.on('activate', () => {
        mainWindow.show();
      });

      app.on('before-quit', () => {
        forceQuit = true;
      });
    } else {
      mainWindow.on('closed', () => {
        mainWindow = null;
      });
    }
  });
});

app.whenReady().then(() => {
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''));
    callback(pathname);
  });
});
