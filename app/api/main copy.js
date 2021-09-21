import path from 'path'
import initSqlJs from 'sql.js'
import fetch from 'cross-fetch'
// const sqlite3 = require('sqlite3').verbose()
// import initSqlJs from 'sql.js/dist/sql-wasm.js'
// let initSqlJs = require('../../node_modules/sql.js/dist/sql-wasm.js')
// const initSqlJs = require('sql-wasm.js')
const { ipcMain } = require('electron')
// const fs = require('fs')
// const fetch = require('node-fetch')

const rootPath = process.cwd()
const fileName = 'db_ger_rm.sqlite3'
const pathToFile = path.resolve(
  path.join(rootPath, '/Banco de Dados/', fileName)
)

// const sqliteDB = new sqlite3.Database(pathToFile, (err) => {
//   if (err) console.error('Database opening error: ', err)
// })

// sqliteDB.run(
//   `CREATE TABLE IF NOT EXISTS alunos (
//     "id"	INTEGER PRIMARY KEY AUTOINCREMENT,
//     "nomeAluno"	TEXT,
//     "nomeAlunoNorm"	TEXT,
//     "dataNasc"	TEXT,
//     "ra"	TEXT UNIQUE,
//     "nomeMae"	TEXT,
//     "nomeMaeNorm"	TEXT
//   );`
// )

// sqlite.run(
//   `INSERT INTO alunos (nomeAluno, nomeAlunoNorm, dataNasc, ra, nomeMae, nomeMaeNorm)
//   VALUES ('John Doe2', 'john doe2', '01012000', '0494167944', 'Bete', 'bete')`
// )

// let config = {
//   locateFile: () => pathToFile,
// }

// initSqlJs(config).then(function (SQL) {
//   console.log("sql.js initialized 🎉");
// })

// const SQL = /* await */ initSqlJs();

// const db = new SQL.Database(pathToFile)

// let initSqlJs = require('../../node_modules/sql.js/dist/sql-wasm.js')

// initSqlJs().then(function (SQL) {
//   const db = new SQL.Database()

//   db.run(
//     `CREATE TABLE IF NOT EXISTS "alunos" (
//     "id"	INTEGER PRIMARY KEY AUTOINCREMENT,
//     "nomeAluno"	TEXT,
//     "nomeAlunoNormalized"	TEXT,
//     "dataNasc"	TEXT,
//     "ra"	TEXT UNIQUE,
//     "nomeMae"	TEXT,
//     "nomeMaeNormalized"	TEXT
//   );`
//   )
//   db.run(
//     `INSERT INTO "alunos" (nomeAluno, nomeAlunoNormalized, dataNasc, ra, nomeMae, nomeMaeNormalized)
//         VALUES ('John Doe', 'john doe', '01012000', '0494167944', 'Bete', 'bete')`
//   )
// })
// const SQL = /* await */ initSqlJs({
//   // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
//   // You can omit locateFile completely when running in node
//   locateFile: (file) => `${pathToFile}${file}`,
// })

// initSqlJs().then(function(SQL){
//   // Load the db
//   const database = new SQL.Database(filebuffer);
// })

// const database = new SQL.Database()

// database.run(
//   `CREATE TABLE IF NOT EXISTS "alunos" (
//     "id"	INTEGER PRIMARY KEY AUTOINCREMENT,
//     "nomeAluno"	TEXT,
//     "nomeAlunoNormalized"	TEXT,
//     "dataNasc"	TEXT,
//     "ra"	TEXT UNIQUE,
//     "nomeMae"	TEXT,
//     "nomeMaeNormalized"	TEXT
//   );`
// )

// const data = db.export();
// const buffer = new Buffer(data);
// fs.writeFileSync("filename.sqlite", buffer);

ipcMain.on('asynchronous-message', async (event, option, values) => {
  const inserted = 'Aluno inserido com sucesso.'
  const selError = 'Erro ao pesquisar aluno.'
  let sql = ''

  let search = {}

  // if (typeof values !== 'object') {
  // search = {
  // nomeAlunoNorm: `/${values[0]}/`,
  // nomeAlunoNorm: `^zzz`,
  // dataNasc: `${values[1]}`,
  // ra: `${values[2]}`,
  // nomeMaeNorm: `${values[3]}`,
  // }
  // }

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
      WHERE nomeAlunoNorm LIKE ?
      AND dataNasc LIKE ?
      AND ra LIKE ?
      AND nomeMaeNorm LIKE ?
      ORDER BY id`

      try {
        console.log(pathToFile);
        const buf = await fetched.arrayBuffer()

        initSqlJs().then(function (SQL) {
          try {
            const binaryArray = new Uint8Array(buf)
            const db = new SQL.Database(binaryArray)

            db.run(
              `CREATE TABLE IF NOT EXISTS alunos (
                "id"	INTEGER PRIMARY KEY AUTOINCREMENT,
                "nomeAluno"	TEXT,
                "nomeAlunoNorm"	TEXT,
                "dataNasc"	TEXT,
                "ra"	TEXT UNIQUE,
                "nomeMae"	TEXT,
                "nomeMaeNorm"	TEXT
              );`)

            db.run(
              `INSERT INTO alunos (nomeAluno, nomeAlunoNorm, dataNasc, ra, nomeMae, nomeMaeNorm)
            VALUES ('John Doe', 'john doe', '01012000', '0494167944', 'Bete', 'bete')`
            )

            // const binaryArray = new Uint8Array(db)

            // console.log(binaryArray)

            let res = db.exec('SELECT * FROM alunos')

            let alunos = []

            res.forEach((aluno) => {
              try {
                alunos.push({
                  id: aluno['values'][0][0],
                  nomeAluno: aluno['values'][0][1],
                  nomeAlunoNorm: aluno['values'][0][2],
                  dataNasc: aluno['values'][0][3],
                  ra: aluno['values'][0][4],
                  nomeMae: aluno['values'][0][5],
                  nomeMaeNorm: aluno['values'][0][6],
                })
              } catch (error) {
                console.log('>>>>> ' + error + ' <<<<<')
              }
            })

            event.reply('asynchronous-reply', alunos)
          } catch (error) {
            console.error(error)
          }
          // const binaryArray = db.export()
          // console.log(binaryArray)

          // db.exec(sql, values, (err, rows) => {
          //   event.reply('asynchronous-reply', (err && err.message) || rows)
          // })
        })
      } catch (error) {
        console.error('>>> ' + error + ' <<<')
      }

      break
  }

  // ------------- neDB ----------- neDB ----------- neDB ----------- neDB --------

  // const Datastore = require('nedb'),
  //   database = new Datastore({
  //     filename: pathToFile,
  //     autoload: true,
  //   })

  // switch (option) {
  //   case 'INSERT':
  //     let nextID = 1

  //     await new Promise((res, rej) => {
  //       database.count({}, (err, n) => {
  //         nextID += n

  //         res(nextID)
  //       })
  //     })
  //       .then(() => {
  //         let aluno = {
  //           id: nextID,
  //           nomeAluno: values.nomeAluno,
  //           nomeAlunoNorm: values.nomeAlunoNorm,
  //           dataNasc: values.dataNasc,
  //           ra: values.ra,
  //           nomeMae: values.nomeMae,
  //           nomeMaeNorm: values.nomeMaeNorm,
  //         }

  //         database.insert(aluno, (err) => {
  //           event.reply('asynchronous-reply', (err && err.message) || inserted)
  //         })
  //       })
  //       .catch(() => {
  //         event.reply('asynchronous-reply', selError)
  //       })

  //     break

  //   case 'INSERT_EXCEL':
  //     // sql = `INSERT INTO
  //     //   alunos (id, nomeAluno, nomeAlunoNormalized, dataNasc, ra, nomeMae, nomeMaeNormalized)
  //     //   VALUES(?, ?, ?, ?, ?, ?, ?)`

  //     // database.run(sql, values, (err) => {
  //     //   event.reply('asynchronous-reply', (err && err.message) || inserted)
  //     // })

  //     break

  //   case 'SELECT':
  //     // let name = '1'
  //     // let data = '01012000'
  //     // let ra = '1'

  //     // let regex = new RegExp(name, 'i')

  //     // let query = {
  //     //   nomeAlunoNorm: {
  //     //     $regex: regex,
  //     //   },
  //     // }

  //     let name = new RegExp('Flavio', 'i')

  //     database
  //       // .find({"nameAlunoNorm": {"$regex": new RegExp('Flavio')}})
  //       .find({ nameAlunoNorm: /Flavio/ })
  //       // .find({"nameAlunoNorm": "Flavio"})
  //       // .find({})
  //       // .sort({ id: 1 })
  //       .exec((err, rows) => {
  //         event.reply('asynchronous-reply', (err && err.message) || rows)
  //       })
  //     break
  // }
})
