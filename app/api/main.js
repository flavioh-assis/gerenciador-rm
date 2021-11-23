import fs from 'fs';
import { ipcMain } from 'electron';
import { join, resolve } from 'path';
import os from 'os';
const { Database } = require('sqlite3').verbose();

const userHomeDirectoryPath = os.homedir();
const desktopDirectoryPath = resolve(
  join(userHomeDirectoryPath, '/Desktop/'),
);
const rmDirectoryPath = resolve(
  join(desktopDirectoryPath, '/Gerenciador de RM/'),
);
const dbDirectoryPath = resolve(join(rmDirectoryPath, '/Banco de Dados/'));
const excelDirectoryPath = resolve(join(rmDirectoryPath, '/Excel/'));
const databaseName = 'rm_mvmi.sqlite3';

let db = '';
let pathDatabase = '';

try {
  if (!fs.existsSync(rmDirectoryPath)) {
    fs.mkdirSync(rmDirectoryPath);
  }

  if (!fs.existsSync(dbDirectoryPath)) {
    fs.mkdirSync(dbDirectoryPath);
  }

  if (!fs.existsSync(excelDirectoryPath)) {
    fs.mkdirSync(excelDirectoryPath);
  }
  pathDatabase = resolve(join(dbDirectoryPath, databaseName));

  db = new Database(pathDatabase, err => {
    if (err) console.error('Database opening error: ', err);
  });

  db.run(
    `CREATE TABLE IF NOT EXISTS "alunos" (
    "id"	INTEGER PRIMARY KEY AUTOINCREMENT,
    "nomeAluno"	TEXT,
    "nomeAlunoNorm"	TEXT,
    "dataNasc"	TEXT,
    "ra"  TEXT UNIQUE,
    "nomeMae"	TEXT,
    "nomeMaeNorm"	TEXT
    );`,
  );
} catch (error) {
  throw error.message;
}

function backupDB() {
  const pathDirectoryBackup = resolve(join(dbDirectoryPath, 'Backup/'));

  if (!fs.existsSync(pathDirectoryBackup)) {
    fs.mkdirSync(pathDirectoryBackup);
  }

  const pathBackup = resolve(join(pathDirectoryBackup, databaseName));

  fs.copyFileSync(pathDatabase, pathBackup);
}

ipcMain.on('asynchronous-message', async (event, option, values) => {
  let sql = '';

  switch (option) {
    case 'GET_LAST_ID':
      sql = `SELECT id
      FROM alunos
      WHERE id = (SELECT MAX(id) FROM alunos)`;

      db.get(sql, (err, last) => {
        if (err) {
          event.reply('asynchronous-reply', err);
        } else {
          const res = last || 0;
          event.reply('asynchronous-reply', res);
        }
      });

      break;

    case 'INSERT':
      const insertedMsg = 'Aluno inserido com sucesso.';

      sql = `INSERT INTO
      alunos (nomeAluno, nomeAlunoNorm, dataNasc, ra, nomeMae, nomeMaeNorm)
      VALUES(?, ?, ?, ?, ?, ?)`;

      try {
        backupDB();

        db.run(sql, values, err => {
          event.reply(
            'asynchronous-reply',
            (err && err.message) || insertedMsg,
          );
        });
      } catch (error) {
        event.reply('asynchronous-reply', error.message);
      }

      break;

    case 'INSERT_EXCEL':
      const numberOfObjects = values.length / 7;
      let valToInsert = values.splice(0, 994);
      let numberValuesToInsert = valToInsert.length / 7;

      const sqlInitial = `INSERT INTO
      alunos (id, nomeAluno, nomeAlunoNorm, dataNasc, ra, nomeMae, nomeMaeNorm)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

      await new Promise((resolve, reject) => {
        do {
          let sql = sqlInitial;

          for (let index = 1; index < numberValuesToInsert; index++) {
            sql += ', (?, ?, ?, ?, ?, ?, ?)';
          }

          try {
            backupDB();

            db.run(sql, valToInsert, err => {
              if (err) {
                reject('ERROR');
                event.reply('asynchronous-reply', err && err.message);
                return 'ERROR';
              }
              resolve(numberOfObjects);
            });
          } catch (error) {
            reject('ERROR');
            event.reply('asynchronous-reply', error.message);
            return 'ERROR';
          }

          valToInsert = values.splice(0, 994);
          numberValuesToInsert = valToInsert.length / 7;
        } while (numberValuesToInsert > 0);
      }).then(totalInserted => {
        event.reply('asynchronous-reply', totalInserted);
      });

      break;

    case 'SELECT':
      sql = `SELECT *
          FROM alunos
          WHERE nomeAlunoNorm LIKE ?
          AND dataNasc LIKE ?
          AND ra LIKE ?
          AND nomeMaeNorm LIKE ?
          ORDER BY id`;

      db.all(sql, values, (err, rows) => {
        event.reply('asynchronous-reply', (err && err.message) || rows);
      });
      break;

    case 'SELECT_EXPORT':
      sql = `SELECT id, nomeAluno, dataNasc, ra, nomeMae
            FROM alunos
            ORDER BY id`;

      db.all(sql, values, (err, rows) => {
        event.reply('asynchronous-reply', (err && err.message) || rows);
      });
      break;
  }
});
