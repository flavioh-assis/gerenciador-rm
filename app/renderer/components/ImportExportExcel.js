import React, { useState } from 'react'
import * as XLSX from 'xlsx'

const IconExport = '../../app/assets/icons/icon-export.png'
const IconImport = '../../app/assets/icons/icon-import.png'

const ImportExportExcel = () => {
  const [excelData, setExcelData] = useState('EMPTY')

  function readExcel(file) {
    const promise = new Promise((resolve, reject) => {
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
    })

    promise.then((data) => {
      setExcelData(data)
      // alert(JSON.stringify(data, null, 1))
      alert(
        'Leitura da planilha concluída! Dados prontos para serem importados.'
      )
    })
  }

  function handleImport() {
    if (excelData !== 'EMPTY') {
      const alunos = []

      excelData.forEach((row) => {
        let aluno = createAluno(row)
        // alert(JSON.stringify(aluno, null, 1))
        alunos.push(aluno)
      })

      postAluno(alunos)

      // setExcelData('EMPTY')
      // document.getElementById('file').value = ''
    } else {
      alert('Erro! Nenhum arquivo selecionado.')
    }
  }

  async function postAluno(alunos) {
    try {
      // alert(JSON.stringify(alunos, null, 1))
      await api.post('/alunos', alunos)
      alert('Dados importados com sucesso!')
    } catch (error) {
      console.log(error)
      alert(JSON.stringify(error.response.data, null, 1))
    }
  }

  function createAluno(row) {
    let nomeAlunoCapd = capitalize(row.nomeAluno)
    let nomeAlunoNormd = normalize(nomeAlunoCapd)
    let dataClean = String(row.dataNasc).replace(/\D+/g, '')
    let raValue = treatRa(row.ra)
    let nomeMaeCapd = capitalize(row.nomeMae)
    let nomeMaeNormd = normalize(nomeMaeCapd)

    return {
      rm: row.rm || null,
      nomeAluno: nomeAlunoCapd,
      nomeAlunoNorm: nomeAlunoNormd,
      dataNasc: dataClean || '01011900',
      ra: raValue || row.rm,
      nomeMae: nomeMaeCapd || 'NÃO INFORMADO',
      nomeMaeNorm: nomeMaeNormd || 'nao informado',
    }
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

      {/* <div className='file'> */}
      <input
        title='Clique para selecionar a planilha'
        id='file'
        type='file'
        onChange={(e) => {
          let selFile = e.target.files[0]
          readExcel(selFile)
        }}
      />
      {/* </div> */}
    </div>
  )
}

export default ImportExportExcel
