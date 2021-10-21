import React, { useState } from 'react'
import fs from 'fs'
import { join, resolve } from 'path'
import XLSX from 'xlsx'

import sendAsync from '../../../app/api/renderer'

const IconExport = '../../app/assets/icons/icon-export.png'
const IconImport = '../../app/assets/icons/icon-import.png'

const ImportExportExcel = () => {
  const [excelData, setExcelData] = useState('EMPTY')

  async function readExcel(file) {
    await new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.readAsArrayBuffer(file)

      fileReader.onload = (e) => {
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
          alert(error)
        }
      }

      fileReader.onerror = (error) => {
        alert(error)
        reject(error)
      }
    }).then((data) => {
      let alunos = []

      try {
        data.forEach((element) => {
          let readDate = String(element.dataNasc)

          if (!readDate.includes('/')) {
            let date = new Date(Date.UTC(0, 0, readDate, -12))

            let dateString = date.toLocaleDateString('pt')

            element = { ...element, dataNasc: dateString }
          }
          // console.log(JSON.stringify(element, null, 2))
          alunos.push(element)
        })
        setExcelData(alunos)
        // alert(JSON.stringify(alunos, null, 2))
        alert(
          'Leitura da planilha concluída! Dados prontos para serem importados.'
        )
      } catch (error) {
        console.log(error)
        alert(error)
      }
    })
  }

  async function handleImport() {
    if (excelData !== 'EMPTY') {
      const alunos = []

      await excelData.forEach((row) => {
        const aluno = createAluno(row)

        // console.log('2- createAluno: ' + aluno[2])

        alunos.push(...aluno)
      })

      postAluno(alunos)

      setExcelData('EMPTY')
      document.getElementById('file').value = ''
    } else {
      alert('Erro! Nenhum arquivo selecionado.')
    }
  }

  function handleExport() {
    try {
      sendAsync('SELECT_EXPORT').then((res) => {
        if (res.includes('ERROR')) {
          showMessage(res, 'Incluir Aluno', 'error')
        } else {
          try {
            const rootPath = process.cwd()
            const fileDirPath = resolve(join(rootPath, '/Excel/'))

            const year = new Date().getFullYear()
            const mon = new Date().getMonth() + 1
            const day = new Date().getDate()

            const fileName = `RM ${year} - mês ${mon} dia ${day}.xlsx`

            if (!fs.existsSync(fileDirPath)) {
              fs.mkdirSync(fileDirPath)
            }

            const pathFile = resolve(join(fileDirPath, fileName))

            // console.log(res);

            // const resTest = [
            //   [1, 'Flavio', '01012000', '1', 'Bete'],
            //   [2, 'Flavio', '01012000', '2', 'Bete'],
            //   [3, 'Flavio', '01012000', '3', 'Bete'],
            //   [4, 'Flavio', '01012000', '4', 'Bete'],
            // ]

            // let idx = 0
            // let alunos = []

            // while (resTest.length > idx) {
            //   alunos.push({
            //     RM: resTest[idx],
            //     Aluno: resTest[idx + 1],
            //     Nasc: resTest[idx + 2],
            //     RA: resTest[idx + 3],
            //     Mãe: resTest[idx + 4],
            //     })

            //   idx += 5
            // }

            const ws = XLSX.utils.json_to_sheet(res, { skipHeader: true })
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, `1991 - ${year}`)
            XLSX.writeFile(wb, pathFile)

            // console.log(ws)
            // console.log(wb)
            console.log('Exportação concluída!')
            alert('Exportação concluída!')
          } catch (error) {
            alert('Algo deu errado na exportação dos dados.')
            console.log(error)
          }
        }
      })
    } catch (error) {
      alert('Erro em adquirir os dados!\n' + error)
      console.log(error)
    }
  }

  async function postAluno(aluno) {
    // console.log('3- postAluno: ' + JSON.stringify(aluno, null, 2))

    await sendAsync('INSERT_EXCEL', aluno)
      .then((res) => {
        if (res.includes('OK')) {
          // alert('Dados inseridos com sucesso!')
          console.log('Dados inseridos com sucesso!')
        } else {
          alert('INSERT_EXCEL ERROR:\n' + JSON.stringify(res))
        }
      })
      .catch((err) => {
        alert(err.message)

        if (err.message.includes('ra')) {
          alert('Já existe esse RA no sistema. Favor, verificar.')
        } else if (err.message.includes('id')) {
          alert('Já existe esse RM no sistema. Favor, verificar.')
          // } else if (res.includes('ERROR')) {
          // showMessage(res, 'Incluir Aluno', 'error')
          // alert(res)
        }
      })
  }

  function createAluno(row) {
    const nomeAlunoCapd = capitalize(row.nomeAluno)
    const nomeAlunoNormd = normalize(nomeAlunoCapd)
    const raValue = treatRa(row.ra)
    const nomeMaeCapd = capitalize(row.nomeMae)
    const nomeMaeNormd = normalize(nomeMaeCapd)

    return [
      row.id || null,
      nomeAlunoCapd,
      nomeAlunoNormd,
      row.dataNasc || '01/01/1900',
      raValue || row.id,
      nomeMaeCapd || 'NÃO INFORMADO',
      nomeMaeNormd || 'nao informado',
    ]
  }

  function capitalize(text) {
    if (text) {
      let arr = [String(text).replace('  ', ' ')]
      arr = String(text).split(' ')

      let textCapitalized = []

      arr.forEach((word) => {
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
        .toLowerCase()
    }
    return null
  }

  function treatRa(ra) {
    if (ra) {
      let addZero = false
      let array = String(ra).split('')
      let newArray = []

      array.forEach((letter) => {
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
        onChange={(e) => {
          let selFile = e.target.files[0]
          readExcel(selFile)
        }}
      />
    </div>
  )
}

export default ImportExportExcel
