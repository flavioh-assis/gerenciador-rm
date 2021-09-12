import path from 'path'
const { ipcMain } = require('electron')

const rootPath = process.cwd()
const fileName = '/database_ger_rm'
const pathToFile = path.resolve(path.join(rootPath, '/Banco de Dados', fileName))

const Datastore = require('nedb'),
  database = new Datastore({
    filename: pathToFile,
    autoload: true,
  })

ipcMain.on('asynchronous-message', async (event, option, values) => {
  const inserted = 'Aluno inserido com sucesso.'
  const selError = 'Erro ao pesquisar aluno.'

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
      let nextID = 1

      await new Promise((res, rej) => {
        database.count({}, (err, n) => {
          nextID += n

          res(nextID)
        })
      })
        .then(() => {
          let aluno = {
            id: nextID,
            nomeAluno: values.nomeAluno,
            nomeAlunoNorm: values.nomeAlunoNorm,
            dataNasc: values.dataNasc,
            ra: values.ra,
            nomeMae: values.nomeMae,
            nomeMaeNorm: values.nomeMaeNorm,
          }

          database.insert(aluno, (err) => {
            event.reply('asynchronous-reply', (err && err.message) || inserted)
          })
        })
        .catch(() => {
          event.reply('asynchronous-reply', selError)
        })

      break

    case 'INSERT_EXCEL':
      // sql = `INSERT INTO
      //   alunos (id, nomeAluno, nomeAlunoNormalized, dataNasc, ra, nomeMae, nomeMaeNormalized)
      //   VALUES(?, ?, ?, ?, ?, ?, ?)`

      // database.run(sql, values, (err) => {
      //   event.reply('asynchronous-reply', (err && err.message) || inserted)
      // })

      break

    case 'SELECT':
      // let name = '|z'
      // let data = '01012000'
      // let ra = '1'

      // let regex = new RegExp(name, 'i')

      // let query = {
      //   $or: [
      //     {
      //       nomeAlunoNorm: {
      //         $regex: regex
      //       }
      //     }
      //   ]
      // }

      database
        .find({})
        .sort({ id: 1 })
        .exec((err, rows) => {
          event.reply(
            'asynchronous-reply',
            (err && err.message) || rows
          )
        })
      break
  }

  // switch (option) {
  //   case 'INSERT':
  //     sql = `INSERT INTO
  //     alunos (nomeAluno, nomeAlunoNormalized, dataNasc, ra, nomeMae, nomeMaeNormalized)
  //     VALUES(?, ?, ?, ?, ?, ?)`

  //     database.run(sql, values, (err) => {
  //       event.reply('asynchronous-reply', (err && err.message) || inserted)
  //     })

  //     break

  //     case 'INSERT_EXCEL':
  //       sql = `INSERT INTO
  //       alunos (id, nomeAluno, nomeAlunoNormalized, dataNasc, ra, nomeMae, nomeMaeNormalized)
  //       VALUES(?, ?, ?, ?, ?, ?, ?)`

  //       database.run(sql, values, (err) => {
  //         event.reply('asynchronous-reply', (err && err.message) || inserted)
  //       })

  //       break

  //   case 'SELECT':
  //     sql = `SELECT *
  //     FROM alunos
  //     WHERE nomeAlunoNormalized LIKE ?
  //     AND dataNasc LIKE ?
  //     AND ra LIKE ?
  //     AND nomeMaeNormalized LIKE ?
  //     ORDER BY id`

  //     database.all(sql, values, (err, rows) => {
  //       event.reply('asynchronous-reply', (err && err.message) || rows)
  //     })
  //     break
  // }
})
