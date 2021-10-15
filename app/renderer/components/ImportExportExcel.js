import React, { useState } from 'react'
import * as XLSX from 'xlsx'

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
          let serial = element.dataNasc
          let data = new Date(Date.UTC(0, 0, serial, -12))
          // console.log(JSON.stringify(data, null, 2))
          let dataString = data.toLocaleDateString('pt')
          // console.log(JSON.stringify(dataString, null, 2))
          let day = dataString.substr(0, 2)
          let month = dataString.substr(3, 2)
          let year = dataString.substr(6, 4)
          let dataFinal = day + month + year
          // console.log(JSON.stringify(dataFinal, null, 2))
          let newData = { ...element, dataNasc: dataFinal }
          // console.log(JSON.stringify(newData, null, 2))
          alunos.push(newData)
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
      sendAsync('SELECT').then((res) => {
        if (res.includes('ERROR')) {
          showMessage(res, 'Incluir Aluno', 'error')
        } else {
        }
      })
    } catch (error) {}
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
    const dataClean = String(row.dataNasc).replace(/\D+/g, '')
    const raValue = treatRa(row.ra)
    const nomeMaeCapd = capitalize(row.nomeMae)
    const nomeMaeNormd = normalize(nomeMaeCapd)

    return [
      row.id || null,
      nomeAlunoCapd,
      nomeAlunoNormd,
      dataClean || '01011900',
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
        <button onClick={() => alert('Exportar')}>
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
