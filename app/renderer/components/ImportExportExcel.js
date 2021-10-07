import React, { useState } from 'react'
import * as XLSX from 'xlsx'

import sendAsync from '../../../app/api/renderer'

const IconExport = '../../app/assets/icons/icon-export.png'
const IconImport = '../../app/assets/icons/icon-import.png'

const ImportExportExcel = () => {
  const [excelData, setExcelData] = useState('EMPTY')

  async function readExcel(file) {
    new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.readAsArrayBuffer(file)

      fileReader.onload = (e) => {
        const bufferArray = e.target.result

        const wb = XLSX.read(bufferArray, { type: 'buffer' })

        const wsName = wb.SheetNames[0]
        const ws = wb.Sheets[wsName]

        const data = XLSX.utils.sheet_to_json(ws)

        resolve(data)
      }

      fileReader.onerror = (error) => {
        reject(error)
      }
    }).then((data) => {
      let alunos = []

      data.forEach((element) => {
        let serial = element.dataNasc
        let datta = new Date(Date.UTC(0, 0, serial, -12))
        // alert(JSON.stringify(datta, null, 2))

        let dataString = datta.toLocaleDateString()
        // alert(JSON.stringify(dataString, null, 2))
        let day = dataString.substr(0, 2)
        let month = dataString.substr(3, 2)
        let year = dataString.substr(6, 4)

        let dataFinal = day + month + year
        // alert(JSON.stringify(dataFinal, null, 2))

        let newData = {...element, dataNasc: dataFinal }
        // alert(JSON.stringify(newData, null, 2))

        alunos.push(newData)
      })

      setExcelData(alunos)
      alert(JSON.stringify(alunos, null, 2))
      // alert(JSON.stringify(data, null, 2))
      alert(
        'Leitura da planilha concluída! Dados prontos para serem importados.'
      )
    })
  }

  async function handleImport() {
    if (excelData !== 'EMPTY') {

      await excelData.forEach((row) => {
        alert(JSON.stringify(row, null, 2))
        let aluno = createAluno(row)
        alert(JSON.stringify(aluno, null, 2))
        postAluno(aluno)
      })

      // setExcelData('EMPTY')
      // document.getElementById('file').value = ''
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
    // try {
    await sendAsync('INSERT_EXCEL', aluno).then((res) => {
      if (res.includes('ra')) {
        alert('Já existe esse RA no sistema. Favor, verificar.')
      } else if(res.includes('id')) {
        alert('Já existe esse RM no sistema. Favor, verificar.')
      // } else if (res.includes('ERROR')) {
        // showMessage(res, 'Incluir Aluno', 'error')
        // alert(res)
      } else if (res.includes('OK')) {
        alert('Dados inseridos com sucesso!')
      } else {
        alert(res)
      }
    })

    // alert('OK')
    // } catch (error) {
    //   showMessage(error, 'Incluir Aluno', 'error')
    // }

    // alert(JSON.stringify(alunos, null, 1))
    // // await api.post('/alunos', alunos)
    // alert('Dados inseridos com sucesso!')
    // console.log(error)
    // alert(JSON.stringify(error.response.data, null, 1))
  }

  function createAluno(row) {
    let nomeAlunoCapd = capitalize(row.nomeAluno)
    let nomeAlunoNormd = normalize(nomeAlunoCapd)
    let dataClean = String(row.dataNasc).replace(/\D+/g, '')
    let raValue = treatRa(row.ra)
    let nomeMaeCapd = capitalize(row.nomeMae)
    let nomeMaeNormd = normalize(nomeMaeCapd)

    return [
      row.rm || null,
      nomeAlunoCapd,
      nomeAlunoNormd,
      dataClean || '01011900',
      raValue || row.rm,
      nomeMaeCapd || 'NÃO INFORMADO',
      nomeMaeNormd || 'nao informado',
    ]
    // return {
    //   id: row.rm || null,
    //   nomeAluno: nomeAlunoCapd,
    //   nomeAlunoNorm: nomeAlunoNormd,
    //   dataNasc: dataClean || '01011900',
    //   ra: raValue || row.rm,
    //   nomeMae: nomeMaeCapd || 'NÃO INFORMADO',
    //   nomeMaeNorm: nomeMaeNormd || 'nao informado',
    // }
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
