import path from 'path'
const { ipcMain } = require('electron')
const sqlite = require('sqlite3').verbose()

const rootPath = process.cwd()
const fileName = 'db_ger_rm.sqlite3'
const pathToFile = path.resolve(
  path.join(rootPath, '/Banco de Dados/', fileName)
)

const database = new sqlite.Database(pathToFile, (err) => {
  if (err) console.error('Database opening error: ', err)
})

database.run(
  `CREATE TABLE IF NOT EXISTS "alunos" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"nomeAluno"	TEXT,
	"nomeAlunoNorm"	TEXT,
	"dataNasc"	TEXT,
	"ra"	TEXT UNIQUE,
	"nomeMae"	TEXT,
	"nomeMaeNorm"	TEXT
  );`
)

// database.run(
//   `INSERT INTO alunos (nomeAluno, nomeAlunoNorm, dataNasc, ra, nomeMae, nomeMaeNorm)
//   VALUES ('John Doe', 'john doe', '01012000', '1', 'Bete', 'bete')`
// )

ipcMain.on('asynchronous-message', (event, option, values) => {
  const inserted = 'Aluno inserido com sucesso.'
  let sql = ''

  switch (option) {
    case 'INSERT':
      sql = `INSERT INTO
      alunos (nomeAluno, nomeAlunoNorm, dataNasc, ra, nomeMae, nomeMaeNorm)
      VALUES(?, ?, ?, ?, ?, ?)`

      database.run(sql, values, (err) => {
        event.reply('asynchronous-reply', (err && err.message) || inserted)
      })

      break

    case 'INSERT_EXCEL':
      sql = `INSERT INTO
        alunos (id, nomeAluno, nomeAlunoNorm, dataNasc, ra, nomeMae, nomeMaeNorm)
        VALUES(?, ?, ?, ?, ?, ?, ?)`

      database.run(sql, values, (err) => {
        event.reply('asynchronous-reply', (err && err.message) || inserted)
      })

      break

    case 'SELECT':
      // sql = `SELECT * FROM alunos`

      sql = `SELECT *
      FROM alunos
      WHERE nomeAlunoNorm LIKE ?
      AND dataNasc LIKE ?
      AND ra LIKE ?
      AND nomeMaeNorm LIKE ?
      ORDER BY id`

      database.all(sql, values, (err, rows) => {
        event.reply('asynchronous-reply', (err && err.message) || rows)
      })
      break
  }
})
