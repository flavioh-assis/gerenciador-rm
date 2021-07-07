const { ipcRenderer } = require('electron')

module.exports = function send(sql, params = []) {
  return new Promise((resolve) => {
    ipcRenderer.once('asynchronous-reply', (_, arg) => {
      resolve(arg)
    })
    ipcRenderer.send('asynchronous-message', sql, params)
  })
}
