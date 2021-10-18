import fs from 'fs'
import { ipcMain } from 'electron'
import { join, resolve } from 'path'
const { Database } = require('sqlite3').verbose()

const rootPath = process.cwd()
const dbDirPath = resolve(join(rootPath, '/Banco_de_Dados/'))
const dbName = 'db_rm.sqlite3'

let db = ''
let pathDB = ''

try {
  if (!fs.existsSync(dbDirPath)) {
    fs.mkdirSync(dbDirPath)
  }
  pathDB = resolve(join(dbDirPath, dbName))

  db = new Database(pathDB, (err) => {
    if (err) console.error('Database opening error: ', err)
  })

  db.run(
    `CREATE TABLE IF NOT EXISTS "alunos" (
    "id"	INTEGER PRIMARY KEY AUTOINCREMENT,
    "nomeAluno"	TEXT,
    "nomeAlunoNorm"	TEXT,
    "dataNasc"	DATE,
    "ra"	TEXT UNIQUE,
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

ipcMain.on('asynchronous-message', (event, option, values) => {
  let sql = ''

  switch (option) {
    case 'INSERT':
      const insertedMsg = 'Aluno inserido com sucesso.'

      sql = `INSERT INTO
      alunos (nomeAluno, nomeAlunoNorm, dataNasc, ra, nomeMae, nomeMaeNorm)
      VALUES(?, ?, ?, ?, ?, ?)`

      try {
        backupDB()

        db.run(sql, values, (err) => {
          event.reply('asynchronous-reply', (err && err.message) || insertedMsg)
        })
      } catch (error) {
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
        sql = sqlInitial

        for (let index = 1; index < nValToInsert; index++) {
          sql += ', (?, ?, ?, ?, ?, ?, ?)'
        }

        try {
          backupDB()

          db.run(sql, valToInsert, (err) => {
            if (err) console.log(err)
            event.reply('asynchronous-reply', (err && err.message) || 'OK')
          })
        } catch (error) {
          console.log(error)
          event.reply('asynchronous-reply', error)
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
