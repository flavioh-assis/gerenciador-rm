import React, { useState } from 'react'
import fs from 'fs'
import { join, resolve } from 'path'
import XLSX from 'xlsx'
const { dialog } = require('electron').remote

import sendAsync from '../../../app/api/renderer'
const IconExport = '../../app/assets/icons/icon-export.png'
const IconImport = '../../app/assets/icons/icon-import.png'

const ImportExportExcel = () => {
  const [excelData, setExcelData] = useState('EMPTY')

  async function readExcel(file) {
    await new Promise((resolve, reject) => {
      const fileReader = new FileReader()

      try {
        fileReader.readAsArrayBuffer(file)

        fileReader.onload = e => {
          const bufferArray = e.target.result

          const wb = XLSX.read(bufferArray, { type: 'buffer' })

          const wsName = wb.SheetNames[0]
          const ws = wb.Sheets[wsName]

          let data = ''

          try {
            data = XLSX.utils.sheet_to_json(ws, {
              header: ['id', 'nomeAluno', 'dataNasc', 'ra', 'nomeMae'],
            })

            const firstCell = data[0].id

            if (!(firstCell > 0)) {
              const newData = XLSX.utils.sheet_to_json(ws, {
                header: ['nomeAluno', 'dataNasc', 'ra', 'nomeMae', 'id'],
              })
              resolve(newData)
            } else {
              resolve(data)
            }
          } catch (error) {
            console.log(error)
            showMessage(error, 'Importar Excel', 'error')
          }
        }
      } catch (error) {
        console.log('Nenhum arquivo selecionado!')
        setExcelData('EMPTY')
        document.getElementById('file').value = ''
      }
      fileReader.onerror = error => {
        showMessage(error, 'Importar Excel', 'error')
        reject(error)
      }
    }).then(data => {
      let alunos = []

      try {
        data.forEach(element => {
          let readDate = element.dataNasc

          if (readDate) {
            if (!String(readDate).includes('/')) {
              let date = new Date(Date.UTC(0, 0, readDate, -12))

              let dateString = date.toLocaleDateString('pt')

              element = { ...element, dataNasc: dateString }
            }
          }
          alunos.push(element)
        })
        setExcelData(alunos)
        showMessage(
          'Leitura da planilha concluída! Dados prontos para serem importados.',
          'Importar Excel',
          'info'
        )
      } catch (error) {
        console.log(error)
        showMessage(
          error,
          'Importar Excel',
          'error'
        )
      }
    })
  }

  async function handleImport() {
    if (excelData !== 'EMPTY') {
      const alunos = []

      await excelData.forEach(row => {
        const aluno = createAluno(row)

        alunos.push(...aluno)
      })

      postAluno(alunos)

      setExcelData('EMPTY')
      document.getElementById('file').value = ''
    } else {
      showMessage(
        'Erro! Nenhum arquivo selecionado.',
        'Importar Excel',
        'error'
      )
    }
  }

  function handleExport() {
    try {
      sendAsync('SELECT_EXPORT').then(res => {
        if (res.includes('ERROR')) {
          showMessage(res, 'Incluir Aluno', 'error')
        } else {
          try {
            const rootPath = process.cwd()
            const fileDirPath = resolve(join(rootPath, '/_Excel/'))

            const year = new Date().getFullYear()
            const mon = new Date().getMonth() + 1
            const day = new Date().getDate()

            const fileName = `RM ${year} - ${day}-${mon}.xlsx`

            if (!fs.existsSync(fileDirPath)) {
              fs.mkdirSync(fileDirPath)
            }

            const pathFile = resolve(join(fileDirPath, fileName))

            const ws = XLSX.utils.json_to_sheet(res, { skipHeader: true })
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, `1991 - ${year}`)
            XLSX.writeFile(wb, pathFile)

            console.log('Exportação concluída!')
            showMessage(
              'Exportação concluída!',
              'Exportar Excel',
              'info'
            )
          } catch (error) {
            showMessage(
              'Algo deu errado na exportação dos dados.',
              'Exportar Excel',
              'error'
            )
            console.log(error)
          }
        }
      })
    } catch (error) {
      showMessage(
        'Erro em adquirir os dados!\n' + error,
        'Exportar Excel',
        'error'
      )
      console.log(error);
    }
  }

  async function postAluno(aluno) {
    let error = false
    let firstIdInserted = 0
    let numberOfInserted = 0

    await sendAsync('GET_LAST_ID').then(id => {
      firstIdInserted = id;
    })

    await sendAsync('INSERT_EXCEL', aluno).then(res => {
      if (String(res).includes('SQLITE')) {
        error = true

        if (res.includes('alunos.ra')) {
          showMessage(
            'Já existe esse RA no sistema. Favor, verificar.',
            'Importar Excel',
            'error'
          )
        } else if (res.includes('alunos.id')) {
          showMessage(
            'Já existe esse RM no sistema. Favor, verificar.',
            'Importar Excel',
            'error'
          )
        } else {
          showMessage(
            res,
            'Importar Excel',
            'error'
          )
          console.log(res)
        }
      } else {
        numberOfInserted = res;
      }
    })

    if (!error) {
      const lastIdIserted = firstIdInserted + numberOfInserted;

      let msg = `Alunos incluídos com sucesso!\n`
      msg += `RM's gerados seguindo a ordem da planilha: do ${firstIdInserted + 1} ao ${lastIdIserted}.`

      showMessage(
        msg,
        'Importar Excel',
        'info'
      )
    }
  }

  function createAluno(row) {
    const id = row.id
    const nomeAlunoCapd = capitalize(row.nomeAluno)
    const nomeAlunoNormd = normalize(nomeAlunoCapd)
    const dataNasc = row.dataNasc
    const raValue = treatRa(row.ra)
    const nomeMaeCapd = capitalize(row.nomeMae)
    const nomeMaeNormd = normalize(nomeMaeCapd)

    return [
      id || null,
      nomeAlunoCapd,
      nomeAlunoNormd,
      dataNasc || '00/00/0000',
      raValue || row.id,
      nomeMaeCapd || 'NÃO INFORMADO',
      nomeMaeNormd || 'nao informado',
    ]
  }

  function capitalize(text) {
    if (text && text !== 'NÃO INFORMADO') {
      let arr = [String(text).replace('  ', ' ')]
      arr = String(text).split(' ')

      let textCapitalized = []

      arr.forEach(word => {
        if (
          word.length > 2 &&
          !RegExp(/\bdas\b|\bdos\b/g).test(word.toLowerCase())
        ) {
          textCapitalized.push(
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
        } else {
          textCapitalized.push(word.toLowerCase())
        }
      })

      return textCapitalized.join(' ')
    }
    return null
  }

  function normalize(text) {
    if (text) {
      return String(text)
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[!@#$%^&*(),.?":{}|<>\[\];/\\'’]/g, '')
        .toLowerCase()
    }
    return null
  }

  function treatRa(ra) {
    if (ra) {
      let addZero = false
      let array = String(ra).split('')
      let newArray = []

      array.forEach(letter => {
        if (!letter.includes('0') || addZero) {
          newArray.push(letter)

          addZero = true
        }
      })

      let cleanRa = newArray.join('')

      return String(cleanRa)
        .replace(/[\W_A-WY-Za-wy-z]/g, '')
        .toUpperCase()
    }
    return null
  }

  function showMessage(message, title, type, values = '') {
    if (type === 'question') {
      dialog
        .showMessageBox({
          buttons: ['SIM', 'NÃO'],
          cancelId: 1,
          defaultId: 0,
          message,
          title,
          type,
        })
        .then(res => {
          if (res.response == 0) {
            // SIM
            postAluno(values, title)
          }
        })
    } else {
      dialog.showMessageBoxSync({
        message,
        title,
        type,
        buttons: ['OK'],
      })
    }
  }

  return (
    <div className='impExpExcel'>
      <p id='title'>Importar / Exportar Dados</p>
      <div id='buttons'>
        <button onClick={handleImport}>
          <img
            src={IconImport}
            title='Inserir dados de uma planilha Excel para o sistema'
            alt=''
          />
          <p>Importar</p>
        </button>
        <button onClick={handleExport}>
          <img
            src={IconExport}
            title='Exportar dados do sistema para uma planilha Excel'
            alt=''
          />
          <p>Exportar</p>
        </button>
      </div>

      <input
        title='Clique para selecionar a planilha'
        id='file'
        type='file'
        onChange={e => {
          let selFile = e.target.files[0]
          readExcel(selFile)
        }}
      />
    </div>
  )
}

export default ImportExportExcel
