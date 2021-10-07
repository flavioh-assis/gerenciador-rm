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
    "rm"	INTEGER PRIMARY KEY AUTOINCREMENT,
    "nomeAluno"	TEXT,
    "nomeAlunoNorm"	TEXT,
    "dataNasc"	TEXT,
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
      sql = `INSERT INTO
        alunos (rm, nomeAluno, nomeAlunoNorm, dataNasc, ra, nomeMae, nomeMaeNorm)
        VALUES(?, ?, ?, ?, ?, ?, ?)`

      try {
        backupDB()
      } catch (error) {
        console.log(error)
        event.reply('asynchronous-reply', error)
      }
      db.run(sql, values, (err) => {
        if (err) console.log(err)
        event.reply('asynchronous-reply', err && err.message) || 'OK'
      })
      break

    case 'SELECT':
      sql = `SELECT rm AS id, nomeAluno, nomeAlunoNorm, dataNasc, ra, nomeMae, nomeMaeNorm
      FROM alunos
      WHERE nomeAlunoNorm LIKE ?
      AND dataNasc LIKE ?
      AND ra LIKE ?
      AND nomeMaeNorm LIKE ?
      ORDER BY rm`

      db.all(sql, values, (err, rows) => {
        event.reply('asynchronous-reply', (err && err.message) || rows)
      })
      break
  }
})
