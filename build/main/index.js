"use strict";

var _path = _interopRequireDefault(require("path"));

var _electron = require("electron");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// require('../api/main')
const isDevelopment = process.env.NODE_ENV === 'development';
let mainWindow = null;
let forceQuit = false;

_electron.crashReporter.start({
  productName: 'Flavio Assis',
  companyName: 'Flavio Assis',
  submitURL: 'https://your-domain.com/url-to-submit',
  uploadToServer: false
});

_electron.app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    _electron.app.quit();
  }
});

_electron.app.on('ready', async () => {
  mainWindow = new _electron.BrowserWindow({
    minWidth: 1160,
    minHeight: 900,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: true
    }
  });
  mainWindow.loadFile(_path.default.resolve(_path.default.join(__dirname, '../renderer/index.html'))); // show window once on first load

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.show();
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

      _electron.app.on('activate', () => {
        mainWindow.show();
      });

      _electron.app.on('before-quit', () => {
        forceQuit = true;
      });
    } else {
      mainWindow.on('closed', () => {
        mainWindow = null;
      });
    }
  });

  if (isDevelopment) {
    // auto-open dev tools
    mainWindow.webContents.openDevTools(); // add inspect element on right click menu

    mainWindow.webContents.on('context-menu', (e, props) => {
      _electron.Menu.buildFromTemplate([{
        label: 'Inspect element',

        click() {
          mainWindow.inspectElement(props.x, props.y);
        }

      }]).popup(mainWindow);
    });
  }
});

_electron.app.whenReady().then(() => {
  _electron.protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''));
    callback(pathname);
  });
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4vaW5kZXguanMiXSwibmFtZXMiOlsiaXNEZXZlbG9wbWVudCIsInByb2Nlc3MiLCJlbnYiLCJOT0RFX0VOViIsIm1haW5XaW5kb3ciLCJmb3JjZVF1aXQiLCJjcmFzaFJlcG9ydGVyIiwic3RhcnQiLCJwcm9kdWN0TmFtZSIsImNvbXBhbnlOYW1lIiwic3VibWl0VVJMIiwidXBsb2FkVG9TZXJ2ZXIiLCJhcHAiLCJvbiIsInBsYXRmb3JtIiwicXVpdCIsIkJyb3dzZXJXaW5kb3ciLCJtaW5XaWR0aCIsIm1pbkhlaWdodCIsInNob3ciLCJ3ZWJQcmVmZXJlbmNlcyIsIm5vZGVJbnRlZ3JhdGlvbiIsIm5vZGVJbnRlZ3JhdGlvbkluV29ya2VyIiwid2ViU2VjdXJpdHkiLCJsb2FkRmlsZSIsInBhdGgiLCJyZXNvbHZlIiwiam9pbiIsIl9fZGlybmFtZSIsIndlYkNvbnRlbnRzIiwib25jZSIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImhpZGUiLCJvcGVuRGV2VG9vbHMiLCJwcm9wcyIsIk1lbnUiLCJidWlsZEZyb21UZW1wbGF0ZSIsImxhYmVsIiwiY2xpY2siLCJpbnNwZWN0RWxlbWVudCIsIngiLCJ5IiwicG9wdXAiLCJ3aGVuUmVhZHkiLCJ0aGVuIiwicHJvdG9jb2wiLCJyZWdpc3RlckZpbGVQcm90b2NvbCIsInJlcXVlc3QiLCJjYWxsYmFjayIsInBhdGhuYW1lIiwiZGVjb2RlVVJJIiwidXJsIiwicmVwbGFjZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7OztBQUNBO0FBRUEsTUFBTUEsYUFBYSxHQUFHQyxPQUFPLENBQUNDLEdBQVIsQ0FBWUMsUUFBWixLQUF5QixhQUEvQztBQUVBLElBQUlDLFVBQVUsR0FBRyxJQUFqQjtBQUNBLElBQUlDLFNBQVMsR0FBRyxLQUFoQjs7QUFFQUMsd0JBQWNDLEtBQWQsQ0FBb0I7QUFDbEJDLEVBQUFBLFdBQVcsRUFBRSxjQURLO0FBRWxCQyxFQUFBQSxXQUFXLEVBQUUsY0FGSztBQUdsQkMsRUFBQUEs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R0MsU0FBUyxDQUFDSCxPQUFPLENBQUNJLEdBQVIsQ0FBWUMsT0FBWixDQUFvQixVQUFwQixFQUFnQyxFQUFoQyxDQUFELENBQTFCO0FBQ0FKLElBQUFBLFFBQVEsQ0FBQ0MsUUFBRCxDQUFSO0FBQ0QsR0FIRDtBQUlELENBTEQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgYXBwLCBCcm93c2VyV2luZG93LCBjcmFzaFJlcG9ydGVyLCBNZW51LCBwcm90b2NvbCB9IGZyb20gJ2VsZWN0cm9uJ1xuLy8gcmVxdWlyZSgnLi4vYXBpL21haW4nKVxuXG5jb25zdCBpc0RldmVsb3BtZW50ID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCdcblxubGV0IG1haW5XaW5kb3cgPSBudWxsXG5sZXQgZm9yY2VRdWl0ID0gZmFsc2VcblxuY3Jhc2hSZXBvcnRlci5zdGFydCh7XG4gIHByb2R1Y3ROYW1lOiAnRmxhdmlvIEFzc2lzJyxcbiAgY29tcGFueU5hbWU6ICdGbGF2aW8gQXNzaXMnLFxuICBzdWJtaXRVUkw6ICdodHRwczovL3lvdXItZG9tYWluLmNvbS91cmwtdG8tc3VibWl0JyxcbiAgdXBsb2FkVG9TZXJ2ZXI6IGZhbHNlLFxufSlcblxuYXBwLm9uKCd3aW5kb3ctYWxsLWNsb3NlZCcsICgpID0+IHtcbiAgLy8gT24gT1MgWCBpdCBpcyBjb21tb24gZm9yIGFwcGxpY2F0aW9ucyBhbmQgdGhlaXIgbWVudSBiYXJcbiAgLy8gdG8gc3RheSBhY3RpdmUgdW50aWwgdGhlIHVzZXIgcXVpdHMgZXhwbGljaXRseSB3aXRoIENtZCArIFFcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICdkYXJ3aW4nKSB7XG4gICAgYXBwLnF1aXQoKVxuICB9XG59KVxuXG5hcHAub24oJ3JlYWR5JywgYXN5bmMgKCkgPT4ge1xuICBtYWluV2luZG93ID0gbmV3IEJyb3dzZXJXaW5kb3coe1xuICAgIG1pbldpZHRoOiAxMTYwLFxuICAgIG1pbkhlaWdodDogOTAwLFxuICAgIHNob3c6IGZhbHNlLFxuICAgIHdlYlByZWZlcmVuY2VzOiB7XG4gICAgICBub2RlSW50ZWdyYXRpb246IHRydWUsXG4gICAgICBub2RlSW50ZWdyYXRpb25JbldvcmtlcjogdHJ1ZSxcbiAgICAgIHdlYlNlY3VyaXR5OiB0cnVlLFxuICAgIH0sXG4gIH0pXG5cbiAgbWFpbldpbmRvdy5sb2FkRmlsZShcbiAgICBwYXRoLnJlc29sdmUocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3JlbmRlcmVyL2luZGV4Lmh0bWwnKSlcbiAgKVxuXG4gIC8vIHNob3cgd2luZG93IG9uY2Ugb24gZmlyc3QgbG9hZFxuICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9uY2UoJ2RpZC1maW5pc2gtbG9hZCcsICgpID0+IHtcbiAgICBtYWluV2luZG93LnNob3coKVxuICB9KVxuXG4gIG1haW5XaW5kb3cud2ViQ29udGVudHMub24oJ2RpZC1maW5pc2gtbG9hZCcsICgpID0+IHtcbiAgICAvLyBIYW5kbGUgd2luZG93IGxvZ2ljIHByb3Blcmx5IG9uIG1hY09TOlxuICAgIC8vIDEuIEFwcCBzaG91bGQgbm90IHRlcm1pbmF0ZSBpZiB3aW5kb3cgaGFzIGJlZW4gY2xvc2VkXG4gICAgLy8gMi4gQ2xpY2sgb24gaWNvbiBpbiBkb2NrIHNob3VsZCByZS1vcGVuIHRoZSB3aW5kb3dcbiAgICAvLyAzLiDijJgrUSBzaG91bGQgY2xvc2UgdGhlIHdpbmRvdyBhbmQgcXVpdCB0aGUgYXBwXG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7XG4gICAgICBtYWluV2luZG93Lm9uKCdjbG9zZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICghZm9yY2VRdWl0KSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgbWFpbldpbmRvdy5oaWRlKClcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgYXBwLm9uKCdhY3RpdmF0ZScsICgpID0+IHtcbiAgICAgICAgbWFpbldpbmRvdy5zaG93KClcbiAgICAgIH0pXG5cbiAgICAgIGFwcC5vbignYmVmb3JlLXF1aXQnLCAoKSA9PiB7XG4gICAgICAgIGZvcmNlUXVpdCA9IHRydWVcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIG1haW5XaW5kb3cub24oJ2Nsb3NlZCcsICgpID0+IHtcbiAgICAgICAgbWFpbldpbmRvdyA9IG51bGxcbiAgICAgIH0pXG4gICAgfVxuICB9KVxuXG4gIGlmIChpc0RldmVsb3BtZW50KSB7XG4gICAgLy8gYXV0by1vcGVuIGRldiB0b29sc1xuICAgIG1haW5XaW5kb3cud2ViQ29udGVudHMub3BlbkRldlRvb2xzKClcblxuICAgIC8vIGFkZCBpbnNwZWN0IGVsZW1lbnQgb24gcmlnaHQgY2xpY2sgbWVudVxuICAgIG1haW5XaW5kb3cud2ViQ29udGVudHMub24oJ2NvbnRleHQtbWVudScsIChlLCBwcm9wcykgPT4ge1xuICAgICAgTWVudS5idWlsZEZyb21UZW1wbGF0ZShbXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0luc3BlY3QgZWxlbWVudCcsXG4gICAgICAgICAgY2xpY2soKSB7XG4gICAgICAgICAgICBtYWluV2luZG93Lmluc3BlY3RFbGVtZW50KHByb3BzLngsIHByb3BzLnkpXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0pLnBvcHVwKG1haW5XaW5kb3cpXG4gICAgfSlcbiAgfVxufSlcblxuYXBwLndoZW5SZWFkeSgpLnRoZW4oKCkgPT4ge1xuICBwcm90b2NvbC5yZWdpc3RlckZpbGVQcm90b2NvbCgnZmlsZScsIChyZXF1ZXN0LCBjYWxsYmFjaykgPT4ge1xuICAgIGNvbnN0IHBhdGhuYW1lID0gZGVjb2RlVVJJKHJlcXVlc3QudXJsLnJlcGxhY2UoJ2ZpbGU6Ly8vJywgJycpKVxuICAgIGNhbGxiYWNrKHBhdGhuYW1lKVxuICB9KVxufSlcbiJdLCJmaWxlIjoibWFpbi9pbmRleC5qcyJ9
