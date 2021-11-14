import fs from 'fs'
import { ipcMain } from 'electron'
import { join, resolve } from 'path'
const { Database } = require('sqlite3').verbose()

const rootPath = process.cwd()
const dbDirPath = resolve(join(rootPath, '/_Banco de Dados/'))
const dbName = 'db_rm.sqlite3'

let db = ''
let pathDB = ''

try {
  if (!fs.existsSync(dbDirPath)) {
    fs.mkdirSync(dbDirPath)
  }
  pathDB = resolve(join(dbDirPath, dbName))

  db = new Database(pathDB, err => {
    if (err) console.error('Database opening error: ', err)
  })

  db.run(
    `CREATE TABLE IF NOT EXISTS "alunos" (
    "id"	INTEGER PRIMARY KEY AUTOINCREMENT,
    "nomeAluno"	TEXT,
    "nomeAlunoNorm"	TEXT,
    "dataNasc"	TEXT,
    "ra"  TEXT UNIQUE,
    "nomeMae"	TEXT,
    "nomeMaeNorm"	TEXT
    );`
  )
} catch (error) {
  throw error.message
}

function backupDB() {
  const pathDirBackup = resolve(join(dbDirPath, 'Backup/'))

  if (!fs.existsSync(pathDirBackup)) {
    fs.mkdirSync(pathDirBackup)
  }

  const pathBackup = resolve(join(pathDirBackup, dbName))

  fs.copyFileSync(pathDB, pathBackup)
}

ipcMain.on('asynchronous-message', async (event, option, values) => {
  let sql = ''

  switch (option) {
    case 'GET_LAST_ID':
      sql = `SELECT count(id)
          FROM alunos`

      db.all(sql, (err, last) => {
        const res = err || last[0]['count(id)'] || 0
        event.reply('asynchronous-reply', res)
      })

      break

    case 'INSERT':
      const insertedMsg = 'Aluno inserido com sucesso.'

      sql = `INSERT INTO
      alunos (nomeAluno, nomeAlunoNorm, dataNasc, ra, nomeMae, nomeMaeNorm)
      VALUES(?, ?, ?, ?, ?, ?)`

      try {
        backupDB()

        db.run(sql, values, err => {
          event.reply('asynchronous-reply', (err && err.message) || insertedMsg)
        })
      } catch (error) {
        console.log(error.message)
        event.reply('asynchronous-reply', error.message)
      }

      break

    case 'INSERT_EXCEL':
      let valToInsert = values.splice(0, 994)
      let nValToInsert = valToInsert.length / 7

      const sqlInitial = `INSERT INTO
      alunos (id, nomeAluno, nomeAlunoNorm, dataNasc, ra, nomeMae, nomeMaeNorm)
      VALUES (?, ?, ?, ?, ?, ?, ?)`

      do {
        let sql = sqlInitial

        for (let index = 1; index < nValToInsert; index++) {
          sql += ', (?, ?, ?, ?, ?, ?, ?)'
        }

        try {
          backupDB()

          db.run(sql, valToInsert, err => {
            if (err) {
              console.log(err)

              event.reply('asynchronous-reply', err && err.message)
              console.log('ERROR')
              return 'ERROR'
            }
            event.reply('asynchronous-reply', 'OK')
          })
        } catch (error) {
          console.log(error)
          event.reply('asynchronous-reply', error.message)
          return 'ERROR'
        }

        valToInsert = values.splice(0, 994)
        nValToInsert = valToInsert.length / 7
      } while (nValToInsert > 0)

      break

    case 'SELECT':
      sql = `SELECT *
          FROM alunos
          WHERE nomeAlunoNorm LIKE ?
          AND dataNasc LIKE ?
          AND ra LIKE ?
          AND nomeMaeNorm LIKE ?
          ORDER BY id`

      db.all(sql, values, (err, rows) => {
        event.reply('asynchronous-reply', (err && err.message) || rows)
      })
      break

    case 'SELECT_EXPORT':
      sql = `SELECT id, nomeAluno, dataNasc, ra, nomeMae
            FROM alunos
            ORDER BY id`

      db.all(sql, values, (err, rows) => {
        event.reply('asynchronous-reply', (err && err.message) || rows)
      })
      break
  }
})
