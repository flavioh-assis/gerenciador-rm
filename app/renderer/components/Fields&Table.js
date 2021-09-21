import React, { useState } from 'react'
import { Button, TextField } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid'
import InputMask from 'react-input-mask'
import sendAsync from '../../../app/api/renderer'
import StringMask from 'string-mask'
const { dialog } = require('electron').remote

export default () => {
  const initialDados = {
    nomeAluno: '',
    dataNasc: '',
    ra: '',
    nomeMae: '',
  }
  const [dados, setDados] = useState({
    nomeAluno: '',
    dataNasc: '',
    ra: '',
    nomeMae: '',
  })
  const [alunos, setAlunos] = useState([
    // {
    //   id: 1,
    //   nomeAluno: 'Flavio',
    //   dataNasc: '01012000',
    //   ra: '1',
    //   nomeMae: 'Bete',
    // },
  ])
  const msgError = {
    correction: 'Por favor, corrija-o.',
    emptyFields: `Os campos "NOME DO ALUNO", "DATA DE NASCIMENTO" e "RA"
precisam ser preenhidos.`,
    unique: 'Já existe esse R.A. no sistema.',
    wrongDate: 'Confira a DATA DE NASCIMENTO inserida e tente novamente.',
    wrongDay: 'O DIA da DATA DE NASCIMENTO está incorreto.',
    wrongMonth: 'O MÊS da DATA DE NASCIMENTO está incorreto.',
    wrongYear: 'O ANO da DATA DE NASCIMENTO está incorreto.',
  }
  const columns = [
    {
      align: 'center',
      field: 'rm',
      headerName: 'RM',
      width: 89,
      headerAlign: 'center',
      sortable: false,
      valueGetter: (params) => {
        let rm = String(params.getValue('id'))
        return StringMask.apply(rm, '###.##0', { reverse: true })
      },
    },
    {
      field: 'nomeAluno',
      flex: 1,
      headerName: 'Nome do Aluno',
      headerAlign: 'center',
    },
    {
      align: 'center',
      field: 'dataMasked',
      headerName: 'Data Nasc.',
      width: 140,
      headerAlign: 'center',
      sortable: false,
      valueGetter: (params) => {
        let date = String(params.getValue('dataNasc'))
        return StringMask.apply(date, '00/00/0000')
      },
    },
    {
      align: 'center',
      field: 'raMasked',
      headerName: 'R.A.',
      width: 160,
      headerAlign: 'center',
      sortable: false,
      valueGetter: (params) => {
        let ra = String(params.getValue('ra'))
        return StringMask.apply(ra, '000.000.000-A')
      },
    },
    {
      field: 'nomeMae',
      flex: 1,
      headerName: 'Nome da Mãe',
      headerAlign: 'center',
    },
    // inuteis
    {
      field: 'id',
      hide: true,
    },
    {
      field: 'dataNasc',
      hide: true,
    },
    {
      field: 'ra',
      hide: true,
    },
  ]

  function capitalize(text) {
    //split the given string into an array of strings
    //whenever a blank space is encountered

    let arr = text.replace('  ', ' ')
    arr = text.split(' ')

    //loop through each element of the array and capitalize the first
    //letter if it have more than 2 chars. If it have less than that, all
    //letters will go to lower case

    let textCapitalized = []

    arr.forEach((word) => {
      if (word.length > 2 && !RegExp(/\bdas|dos/g).test(word.toLowerCase())) {
        textCapitalized.push(
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
      } else {
        textCapitalized.push(word.toLowerCase())
      }
    })

    //Join all the elements of the array back into a string
    //using a blankspace as a separator

    return textCapitalized.join(' ')
  }

  function clearFields() {
    setDados(initialDados)
  }

  function createRegExpDate() {
    return new RegExp(
      /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g
    )
  }

  function insertAluno() {
    let dataClean = String(dados.dataNasc).replace(/\D+/g, '')

    let regex = createRegExpDate()

    // if ([nomeAluno, dataClean, ra].includes('')) {
    //   showMessage(msgError.emptyFields, 'Erro ao Incluir Aluno', 'error')
    // } else if (!validateDateLength(dataClean)) {
    //   showMessage(msgError.wrongDate, 'Erro ao Incluir Aluno', 'error')
    // } else {
    //   let year = parseInt(dataClean.substr(4, 4), 10)
    //   let currentYear = new Date().getFullYear()

    //   if (year < 2000 || year > currentYear - 5) {
    //     let errorMsg = `${msgError.wrongYear} ${msgError.correction}`
    //     showMessage(errorMsg, 'Erro ao Incluir Aluno', 'error')
    //   } else if (!regex.test(dataNasc)) {
    //     let month = parseInt(dataClean.substr(2, 2), 10)

    //     if (month < 1 || month > 12) {
    //       let errorMsg = `${msgError.wrongMonth} ${msgError.correction}`
    //       showMessage(errorMsg, 'Erro ao Incluir Aluno', 'error')
    //     } else {
    //       let errorMsg = `${msgError.wrongDay} ${msgError.correction}`
    //       showMessage(errorMsg, 'Erro ao Incluir Aluno', 'error')
    //     }
    //   } else {
    let newRA = treatRaValue(dados.ra)
    let nomeAlunoCap = capitalize(dados.nomeAluno)
    let nomeMaeCap = capitalize(dados.nomeMae)

    // const values = [
    //   `${}`,
    //   `${normalize(nomeAlunoCap)}`,
    //   `${dataClean}`,
    //   `${newRA}`,
    //   `${nomeMaeCap}`,
    //   `${normalize(nomeMaeCap)}`,
    // ]
    let values = {
      id: null,
      nomeAluno: nomeAlunoCap,
      nomeAlunoNorm: normalize(nomeAlunoCap),
      dataNasc: dataClean,
      ra: newRA,
      nomeMae: nomeMaeCap,
      nomeMaeNorm: normalize(nomeMaeCap),
    }

    let msgParts = ['Confira os dados abaixo:\n']
    msgParts.push(nomeAlunoCap)
    msgParts.push(dados.dataNasc)
    msgParts.push(StringMask.apply(newRA, '000.000.000-A'))
    msgParts.push(nomeMaeCap || 'MÃE NÃO INFORMADA')
    msgParts.push('\nOs dados estão corretos?')

    let msg = msgParts.join('\n')

    dialog
      .showMessageBox({
        buttons: ['SIM', 'NÃO'],
        message: msg,
        title: 'Deseja incluir o(a) aluno(a)?',
        type: 'question',
      })
      .then((res) => {
        if (res.response == 0) {
          // SIM
          sendAsync('INSERT', values).then((res) => {
            if (res.includes('UNIQUE')) {
              let errorMsg = `${msgError.unique} ${msgError.correction}`
              showMessage(errorMsg, 'Incuir Aluno', 'error')
            } else if (res.includes('ERROR')) {
              showMessage(res, 'Incuir Aluno', 'error')
            } else {
              showMessage(res, 'Incuir Aluno', 'info')
              clearFields()
            }
          })
        }
      })
  }

  // insert data from a .xslx file
  function insertAlunoExcel() {
    let dictPath = process.cwd()
    let fileName = 'RM_2020_base.xlsx'
    let filePath = `${dictPath}/${fileName}`

    readXlsxFile(filePath).then((rows) => {
      rows.forEach((row, index) => {
        let norm = normalize(row)
        let newRa = parseInt(index + 1, 10)

        const values = [
          `${newRa}`,
          `${row}`,
          norm,
          '00000000',
          `${treatRaValue(newRa)}`,
          '',
          '',
        ]
        sendAsync('INSERT_EXCEL', values).then((res) => {
          if (res.includes('ERROR')) {
            showMessage(res, 'Incuir Aluno', 'error')
          }
        })
      })
    })
  }

  function normalize(text) {
    return String(text)
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
  }

  function searchAluno() {
    let newRA = treatRaValue(dados.ra)

    const values = [
      `${normalize(dados.nomeAluno)}%`,
      `${String(dados.dataNasc).replace(/\D+/g, '')}%`,
      `${newRA}%`,
      `${normalize(dados.nomeMae)}%`,
    ]

    // alert(JSON.stringify(values, null, 1))

    // const values = {
    //   nomeAlunoNormalized: `${normalize(dados.nomeAluno)}`,
    //   dataNasc: `${dataNasc.replace(/\D+/g, '')}`,
    //   ra: `${newRA}`,
    //   nomeMaeNormalized: `${normalize(nomeMae)}`,
    // }

    sendAsync('SELECT', values).then((resp) => {
      if (resp.includes('ERROR')) {
        showMessage(resp, 'Pesquisar Aluno', 'error')
      } else {
        showMessage(JSON.stringify(resp, null, 1), 'searchAluno', 'info')
        // showMessage(JSON.stringify(resp[0]['values'][0][0], null, 1), 'searchAluno', 'info')
        setAlunos(resp)
      }
    })
  }

  function showMessage(message, title, type) {
    dialog.showMessageBox({
      message,
      title,
      type,
      buttons: ['OK'],
    })
  }

  function treatRaValue(value) {
    let raUnmasked = String(value).replace(/[\W_]/g, '').toUpperCase()

    return raUnmasked
    // if (raUnmasked.length == 0) {
    //   return '%'
    // } else {
    //   return StringMask.apply(raUnmasked, '000000000A', { reverse: true })
    // }
  }

  function validateDateLength(string) {
    return RegExp(/\d{8}/g).test(string)
  }

  return (
    <div className='fields_table'>
      <div className='fields'>
        <TextField
          id='nomeAluno'
          label='Nome do Aluno'
          onChange={(t) => setDados({ ...dados, nomeAluno: t.target.value })}
          value={dados.nomeAluno}
          variant='outlined'
        />

        <InputMask
          id='dataNasc'
          onChange={(t) => setDados({ ...dados, dataNasc: t.target.value })}
          mask='99/99/9999'
          value={dados.dataNasc}
        >
          {() => <TextField label='Data de Nascimento' variant='outlined' />}
        </InputMask>

        <InputMask
          id='ra'
          onChange={(t) => setDados({ ...dados, ra: t.target.value })}
          mask='999.999.999-*'
          value={dados.ra}
        >
          {() => <TextField label='R.A.' variant='outlined' />}
        </InputMask>

        <TextField
          id='nomeMae'
          label='Nome da Mãe'
          onChange={(t) => setDados({ ...dados, nomeMae: t.target.value })}
          value={dados.nomeMae}
          variant='outlined'
        />
      </div>

      <div className='buttons'>
        <Button className='button' id='incluir' onClick={insertAluno}>
          Incluir Aluno
        </Button>

        <Button className='button' id='pesquisar' onClick={searchAluno}>
          Pesquisar Aluno
        </Button>

        <Button className='button' id='limpar' onClick={clearFields}>
          Limpar Campos
        </Button>
      </div>

      <div className='table'>
        <DataGrid
          autoHeight
          columns={columns}
          disableColumnMenu={true}
          disableSelectionOnClick
          pageSize={5}
          rows={alunos}
          rowHeight={45}
        />
      </div>
    </div>
  )
}
