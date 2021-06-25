const builder = require('electron-builder');

function packWin() {
  return builder.build({
    targets: builder.Platform.WINDOWS.createTarget(),
  });
}

function packLinux() {
  return builder.build({
    targets: builder.Platform.LINUX.createTarget(),
  });
}

packWin.displayName = 'builder-win';
packLinux.displayName = 'builder-linux';

exports.packWin = packWin;
exports.packLinux = packLinux;
