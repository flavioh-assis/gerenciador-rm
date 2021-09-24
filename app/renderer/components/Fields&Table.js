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
    //   id: 80000,
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
        return applyMask(rm, 'rm')
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
        return applyMask(date, 'data')
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
        return applyMask(ra, 'ra')
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

  //---------------------- HANDLERS --------------------------
  function incluirAlunoHandler() {
    const dataClean = treatDataNasc(dados.dataNasc) 

    if (
      [dados.nomeAluno, treatDataNasc(dados.dataNasc), dados.ra].includes('')
    ) {
      showMessage(msgError.emptyFields, 'Erro ao Incluir Aluno', 'error')
    } else if (!validateDateLength(dataClean)) {
      showMessage(msgError.wrongDate, 'Erro ao Incluir Aluno', 'error')
    } else {
      const dataSliced = sliceDate(treatDataNasc(dados.dataNasc))
      const currentYear = new Date().getFullYear()

      if (dataSliced.year < 2000 || dataSliced.year > currentYear - 5) {
        let errorMsg = `${msgError.wrongYear} ${msgError.correction}`
        showMessage(errorMsg, 'Erro ao Incluir Aluno', 'error')

      } else if (!validateDate(dados.dataNasc)) {
        if (dataSliced.month < 1 || dataSliced.month > 12) {
          let errorMsg = `${msgError.wrongMonth} ${msgError.correction}`
          showMessage(errorMsg, 'Erro ao Incluir Aluno', 'error')
        } else {
          let errorMsg = `${msgError.wrongDay} ${msgError.correction}`
          showMessage(errorMsg, 'Erro ao Incluir Aluno', 'error')
        }
      } else {
        const values = createValuesArray()

        const msg = createQuestionMessage(values)

        showMessage(msg, 'Incluir Aluno(a)', 'question', values)
      }
    }
  }

  function sliceDate(date) {
    return {
      month: parseInt(date.substr(2, 2), 10),
      year: parseInt(date.substr(4, 4), 10),
    }
  }

  function postAlunoExcel() {
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
          `${treatRa(newRa)}`,
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

  function searchAluno() {
    let raValue = treatRa(dados.ra)

    const values = [
      `${normalize(dados.nomeAluno)}%`,
      `${String(dados.dataNasc).replace(/\D+/g, '')}%`,
      `${raValue}%`,
      `${normalize(dados.nomeMae)}%`,
    ]

    sendAsync('SELECT', values).then((resp) => {
      if (resp.includes('ERROR')) {
        showMessage(resp, 'Pesquisar Aluno', 'error')
      } else {
        if (resp.length === 0) {
          showMessage('Nenhum aluno encontrado!', 'Pesquisar Aluno', 'info')
        }
        setAlunos(resp)
      }
    })
  }

  function clearFieldsHandler() {
    setDados(initialDados)
  }

  //---------------------- CREATORS --------------------------
  function createValuesArray() {
    return [
      capitalize(dados.nomeAluno),
      normalize(dados.nomeAluno),
      treatDataNasc(dados.dataNasc),
      treatRa(dados.ra),
      capitalize(dados.nomeMae),
      normalize(dados.nomeMae),
    ]
  }

  function createQuestionMessage(values) {
    return `Confira os dados abaixo:
    Aluno: ${values[0]}
    Nasc.:  ${applyMask(values[2], 'data')}
    RA.:      ${applyMask(values[3], 'ra')}
    Mãe:    ${values[4] || 'NÃO INFORMADA'}\n
    Os dados estão corretos?`
  }

  //---------------------- TRANSFORMERS --------------------------
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

  function applyMask(value, type) {
    switch (type) {
      case 'data':
        return StringMask.apply(value, '00/00/0000')

      case 'ra':
        return StringMask.apply(value, '000.000.000-A')

      case 'rm':
        return StringMask.apply(value, '###.##0', { reverse: true })
    }
  }

  function normalize(text) {
    return String(text)
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[`´'"]/g, '')
      .toLowerCase()
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
        .then((res) => {
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

  //---------------------- DATABASE QUERIES --------------------------
  function postAluno(values, title) {
    sendAsync('INSERT', values).then((res) => {
      if (res.includes('UNIQUE')) {
        let errorMsg = `${msgError.unique} ${msgError.correction}`
        showMessage(errorMsg, title, 'error')
      } else if (res.includes('ERROR')) {
        showMessage(res, title, 'error')
      } else {
        showMessage(res, title, 'info')
        clearFieldsHandler()
      }
    })
  }

  function treatDataNasc(value) {
    return String(value).replace(/\D+/g, '')
  }

  function treatRa(value) {
    return String(value).replace(/[\W_]/g, '').toUpperCase()
  }

  //---------------------- VALIDATORS --------------------------
  function validateDate(date) {
    alert(date)
    let test = new RegExp(
      /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g
    ).test(date)
      alert(test)
    return test
  }

  function validateDateLength(date) {
    return RegExp(/\d{8}/g).test(date)
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
        <Button className='button' id='incluir' onClick={incluirAlunoHandler}>
          Incluir Aluno
        </Button>

        <Button className='button' id='pesquisar' onClick={searchAluno}>
          Pesquisar Aluno
        </Button>

        <Button className='button' id='limpar' onClick={clearFieldsHandler}>
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
