const { ipcMain } = require('electron')
const sqlite = require('sqlite3').verbose()

const database = new sqlite.Database('./app/api/database/rm.sqlite3', (err) => {
  if (err) console.error('Database opening error: ', err)
})

database.run(
  `CREATE TABLE IF NOT EXISTS "alunos" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"nomeAluno"	TEXT,
	"nomeAlunoNormalized"	TEXT,
	"dataNasc"	TEXT,
	"ra"	TEXT UNIQUE,
	"nomeMae"	TEXT,
	"nomeMaeNormalized"	TEXT
  );`
)

ipcMain.on('asynchronous-message', (event, option, values) => {
  const inserted = 'Aluno inserido com sucesso.'
  let sql = ''

  switch (option) {
    case 'INSERT':
      sql = `INSERT INTO
      alunos (nomeAluno, nomeAlunoNormalized, dataNasc, ra, nomeMae, nomeMaeNormalized)
      VALUES(?, ?, ?, ?, ?, ?)`

      database.run(sql, values, (err) => {
        event.reply('asynchronous-reply', (err && err.message) || inserted)
      })

      break

      case 'INSERT_EXCEL':
        sql = `INSERT INTO
        alunos (id, nomeAluno, nomeAlunoNormalized, dataNasc, ra, nomeMae, nomeMaeNormalized)
        VALUES(?, ?, ?, ?, ?, ?, ?)`
  
        database.run(sql, values, (err) => {
          event.reply('asynchronous-reply', (err && err.message) || inserted)
        })
  
        break
  
    case 'SELECT':
      sql = `SELECT *
      FROM alunos
      WHERE nomeAlunoNormalized LIKE ?
      AND dataNasc LIKE ?
      AND ra LIKE ?
      AND nomeMaeNormalized LIKE ?
      ORDER BY id`

      database.all(sql, values, (err, rows) => {
        event.reply('asynchronous-reply', (err && err.message) || rows)
      })
      break
  }
})
