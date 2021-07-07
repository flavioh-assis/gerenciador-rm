const { ipcMain } = require('electron')
const sqlite = require('sqlite3').verbose()

const database = new sqlite.Database('./app/api/database/rm.sqlite3', (err) => {
  if (err) console.error('Database opening error: ', err)
})

ipcMain.on('asynchronous-message', (event, option, values) => {
  const inserted = 'Aluno inserido com sucesso.'
  let sql = ''

  switch (option) {
    case 'INSERT':
      sql = `INSERT INTO
      alunos (nomeAluno, dataNasc, ra, nomeMae)
      VALUES(?, ?, ?, ?)`

      database.run(sql, values, (err) => {
        event.reply('asynchronous-reply', (err && err.message) || inserted)
      })
      break

    case 'SELECT':
      sql = `SELECT *
      FROM alunos
      WHERE nomeAluno LIKE ?
      AND dataNasc LIKE ?
      AND ra LIKE ?
      AND nomeMae LIKE ?
      ORDER BY id`

      database.all(sql, values, (err, rows) => {
        event.reply('asynchronous-reply', (err && err.message) || rows)
      })
      break
  }
})
