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
    width: 1366,
    height: 880,
    minWidth: 1160,
    minHeight: 800,
    maxWidth: 1366,
    maxHeight: 880,
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4vaW5kZXguanMiXSwibmFtZXMiOlsiaXNEZXZlbG9wbWVudCIsInByb2Nlc3MiLCJlbnYiLCJOT0RFX0VOViIsIm1haW5XaW5kb3ciLCJmb3JjZVF1aXQiLCJjcmFzaFJlcG9ydGVyIiwic3RhcnQiLCJwcm9kdWN0TmFtZSIsImNvbXBhbnlOYW1lIiwic3VibWl0VVJMIiwidXBsb2FkVG9TZXJ2ZXIiLCJhcHAiLCJvbiIsInBsYXRmb3JtIiwicXVpdCIsIkJyb3dzZXJXaW5kb3ciLCJ3aWR0aCIsImhlaWdodCIsIm1pbldpZHRoIiwibWluSGVpZ2h0IiwibWF4V2lkdGgiLCJtYXhIZWlnaHQiLCJzaG93Iiwid2ViUHJlZmVyZW5jZXMiLCJub2RlSW50ZWdyYXRpb24iLCJub2RlSW50ZWdyYXRpb25JbldvcmtlciIsIndlYlNlY3VyaXR5IiwibG9hZEZpbGUiLCJwYXRoIiwicmVzb2x2ZSIsImpvaW4iLCJfX2Rpcm5hbWUiLCJ3ZWJDb250ZW50cyIsIm9uY2UiLCJlIiwicHJldmVudERlZmF1bHQiLCJoaWRlIiwib3BlbkRldlRvb2xzIiwicHJvcHMiLCJNZW51IiwiYnVpbGRGcm9tVGVtcGxhdGUiLCJsYWJlbCIsImNsaWNrIiwiaW5zcGVjdEVsZW1lbnQiLCJ4IiwieSIsInBvcHVwIiwid2hlblJlYWR5IiwidGhlbiIsInByb3RvY29sIiwicmVnaXN0ZXJGaWxlUHJvdG9jb2wiLCJyZXF1ZXN0IiwiY2FsbGJhY2siLCJwYXRobmFtZSIsImRlY29kZVVSSSIsInVybCIsInJlcGxhY2UiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7Ozs7QUFDQTtBQUVBLE1BQU1BLGFBQWEsR0FBR0MsT0FBTyxDQUFDQyxHQUFSLENBQVlDLFFBQVosS0FBeUIsYUFBL0M7QUFFQSxJQUFJQyxVQUFVLEdBQUcsSUFBakI7QUFDQSxJQUFJQyxTQUFTLEdBQUcsS0FBaEI7O0FBRUFDLHdCQUFjQyxLQUFkLENBQW9CO0FBQ2xCQyxFQUFBQSxXQUFXLEVBQUUsY0FESztB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QVBUO0FBUUQsS0FURDtBQVVEO0FBQ0YsQ0FwRUQ7O0FBc0VBUSxjQUFJb0MsU0FBSixHQUFnQkMsSUFBaEIsQ0FBcUIsTUFBTTtBQUN6QkMscUJBQVNDLG9CQUFULENBQThCLE1BQTlCLEVBQXNDLENBQUNDLE9BQUQsRUFBVUMsUUFBVixLQUF1QjtBQUMzRCxVQUFNQyxRQUFRLEdBQUdDLFNBQVMsQ0FBQ0gsT0FBTyxDQUFDSSxHQUFSLENBQVlDLE9BQVosQ0FBb0IsVUFBcEIsRUFBZ0MsRUFBaEMsQ0FBRCxDQUExQjtBQUNBSixJQUFBQSxRQUFRLENBQUNDLFFBQUQsQ0FBUjtBQUNELEdBSEQ7QUFJRCxDQUxEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IGFwcCwgQnJvd3NlcldpbmRvdywgY3Jhc2hSZXBvcnRlciwgTWVudSwgcHJvdG9jb2wgfSBmcm9tICdlbGVjdHJvbidcbi8vIHJlcXVpcmUoJy4uL2FwaS9tYWluJylcblxuY29uc3QgaXNEZXZlbG9wbWVudCA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnXG5cbmxldCBtYWluV2luZG93ID0gbnVsbFxubGV0IGZvcmNlUXVpdCA9IGZhbHNlXG5cbmNyYXNoUmVwb3J0ZXIuc3RhcnQoe1xuICBwcm9kdWN0TmFtZTogJ0ZsYXZpbyBBc3NpcycsXG4gIGNvbXBhbnlOYW1lOiAnRmxhdmlvIEFzc2lzJyxcbiAgc3VibWl0VVJMOiAnaHR0cHM6Ly95b3VyLWRvbWFpbi5jb20vdXJsLXRvLXN1Ym1pdCcsXG4gIHVwbG9hZFRvU2VydmVyOiBmYWxzZSxcbn0pXG5cbmFwcC5vbignd2luZG93LWFsbC1jbG9zZWQnLCAoKSA9PiB7XG4gIC8vIE9uIE9TIFggaXQgaXMgY29tbW9uIGZvciBhcHBsaWNhdGlvbnMgYW5kIHRoZWlyIG1lbnUgYmFyXG4gIC8vIHRvIHN0YXkgYWN0aXZlIHVudGlsIHRoZSB1c2VyIHF1aXRzIGV4cGxpY2l0bHkgd2l0aCBDbWQgKyBRXG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnZGFyd2luJykge1xuICAgIGFwcC5xdWl0KClcbiAgfVxufSlcblxuYXBwLm9uKCdyZWFkeScsIGFzeW5jICgpID0+IHtcbiAgbWFpbldpbmRvdyA9IG5ldyBCcm93c2VyV2luZG93KHtcbiAgICB3aWR0aDogMTM2NixcbiAgICBoZWlnaHQ6IDg4MCxcbiAgICBtaW5XaWR0aDogMTE2MCxcbiAgICBtaW5IZWlnaHQ6IDgwMCxcbiAgICBtYXhXaWR0aDogMTM2NixcbiAgICBtYXhIZWlnaHQ6IDg4MCxcbiAgICBzaG93OiBmYWxzZSxcbiAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgbm9kZUludGVncmF0aW9uOiB0cnVlLFxuICAgICAgbm9kZUludGVncmF0aW9uSW5Xb3JrZXI6IHRydWUsXG4gICAgICB3ZWJTZWN1cml0eTogdHJ1ZSxcbiAgICB9LFxuICB9KVxuXG4gIG1haW5XaW5kb3cubG9hZEZpbGUoXG4gICAgcGF0aC5yZXNvbHZlKHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9yZW5kZXJlci9pbmRleC5odG1sJykpXG4gIClcblxuICAvLyBzaG93IHdpbmRvdyBvbmNlIG9uIGZpcnN0IGxvYWRcbiAgbWFpbldpbmRvdy53ZWJDb250ZW50cy5vbmNlKCdkaWQtZmluaXNoLWxvYWQnLCAoKSA9PiB7XG4gICAgbWFpbldpbmRvdy5zaG93KClcbiAgfSlcblxuICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9uKCdkaWQtZmluaXNoLWxvYWQnLCAoKSA9PiB7XG4gICAgLy8gSGFuZGxlIHdpbmRvdyBsb2dpYyBwcm9wZXJseSBvbiBtYWNPUzpcbiAgICAvLyAxLiBBcHAgc2hvdWxkIG5vdCB0ZXJtaW5hdGUgaWYgd2luZG93IGhhcyBiZWVuIGNsb3NlZFxuICAgIC8vIDIuIENsaWNrIG9uIGljb24gaW4gZG9jayBzaG91bGQgcmUtb3BlbiB0aGUgd2luZG93XG4gICAgLy8gMy4g4oyYK1Egc2hvdWxkIGNsb3NlIHRoZSB3aW5kb3cgYW5kIHF1aXQgdGhlIGFwcFxuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgICAgbWFpbldpbmRvdy5vbignY2xvc2UnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoIWZvcmNlUXVpdCkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIG1haW5XaW5kb3cuaGlkZSgpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGFwcC5vbignYWN0aXZhdGUnLCAoKSA9PiB7XG4gICAgICAgIG1haW5XaW5kb3cuc2hvdygpXG4gICAgICB9KVxuXG4gICAgICBhcHAub24oJ2JlZm9yZS1xdWl0JywgKCkgPT4ge1xuICAgICAgICBmb3JjZVF1aXQgPSB0cnVlXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBtYWluV2luZG93Lm9uKCdjbG9zZWQnLCAoKSA9PiB7XG4gICAgICAgIG1haW5XaW5kb3cgPSBudWxsXG4gICAgICB9KVxuICAgIH1cbiAgfSlcblxuICBpZiAoaXNEZXZlbG9wbWVudCkge1xuICAgIC8vIGF1dG8tb3BlbiBkZXYgdG9vbHNcbiAgICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9wZW5EZXZUb29scygpXG5cbiAgICAvLyBhZGQgaW5zcGVjdCBlbGVtZW50IG9uIHJpZ2h0IGNsaWNrIG1lbnVcbiAgICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9uKCdjb250ZXh0LW1lbnUnLCAoZSwgcHJvcHMpID0+IHtcbiAgICAgIE1lbnUuYnVpbGRGcm9tVGVtcGxhdGUoW1xuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdJbnNwZWN0IGVsZW1lbnQnLFxuICAgICAgICAgIGNsaWNrKCkge1xuICAgICAgICAgICAgbWFpbldpbmRvdy5pbnNwZWN0RWxlbWVudChwcm9wcy54LCBwcm9wcy55KVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdKS5wb3B1cChtYWluV2luZG93KVxuICAgIH0pXG4gIH1cbn0pXG5cbmFwcC53aGVuUmVhZHkoKS50aGVuKCgpID0+IHtcbiAgcHJvdG9jb2wucmVnaXN0ZXJGaWxlUHJvdG9jb2woJ2ZpbGUnLCAocmVxdWVzdCwgY2FsbGJhY2spID0+IHtcbiAgICBjb25zdCBwYXRobmFtZSA9IGRlY29kZVVSSShyZXF1ZXN0LnVybC5yZXBsYWNlKCdmaWxlOi8vLycsICcnKSlcbiAgICBjYWxsYmFjayhwYXRobmFtZSlcbiAgfSlcbn0pXG4iXSwiZmlsZSI6Im1haW4vaW5kZXguanMifQ==
