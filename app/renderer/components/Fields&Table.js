import React, { useState, useEffect } from 'react'
import { Button, TextField } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid'
import InputMask from 'react-input-mask'
import MacAddress from 'macaddress'
import StringMask from 'string-mask'
const { dialog } = require('electron').remote

import sendAsync from '../../../app/api/renderer'

export default () => {
  const authorizedMACs = [
    '70:85:c2:77:72:c4', // linux eth
    '60:e3:27:24:fa:a7', // linux wifi
    'b8:97:5a:5e:b0:f1', // PC Sec Flavio
    '30:9c:23:ab:d9:5d', // PC Sec Rose
  ]
  const columns = [
    {
      align: 'center',
      field: 'rm',
      headerName: 'RM',
      width: 89,
      headerAlign: 'center',
      sortable: false,
      valueGetter: (params) => {
        const rm = String(params.getValue('id'))
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
      field: 'dataNasc',
      headerName: 'Data Nasc.',
      width: 140,
      headerAlign: 'center',
      sortable: false,
    },
    {
      align: 'center',
      field: 'raMasked',
      headerName: 'R.A.',
      width: 160,
      headerAlign: 'center',
      sortable: false,
      valueGetter: (params) => {
        const ra = String(params.getValue('ra'))
        return applyMask(ra, 'ra')
      },
    },
    {
      field: 'nomeMae',
      flex: 1,
      headerName: 'Nome da Mãe',
      headerAlign: 'center',
    },
    {
      field: 'id',
      hide: true,
    },
    {
      field: 'ra',
      hide: true,
    },
  ]
  const initialDados = {
    nomeAluno: '',
    dataNasc: '',
    ra: '',
    nomeMae: '',
  }
  const msgError = {
    correction: 'Por favor, faça a correção.',
    emptyFields: `Os campos "NOME DO ALUNO", "DATA DE NASCIMENTO" e "RA" precisam ser preenhidos.`,
    macNotAuthorized:
      'Esse computador não está autorizado para o uso do sistema ou está sem acesso à internet.',
    unique: 'Já existe esse R.A. no sistema.',
    wrongDate: 'Confira a DATA DE NASCIMENTO inserida e tente novamente.',
    wrongDay: 'O DIA da DATA DE NASCIMENTO está incorreto.',
    wrongMonth: 'O MÊS da DATA DE NASCIMENTO está incorreto.',
    wrongYear: 'O ANO da DATA DE NASCIMENTO está incorreto.',
  }
  const [alunos, setAlunos] = useState([])
  const [dados, setDados] = useState({
    nomeAluno: '',
    dataNasc: '',
    ra: '',
    nomeMae: '',
  })
  const [page, setPage] = useState(0)
  const [runApp, setRunApp] = useState(false)

  useEffect(() => {
    MacAddress.all().then((networks) => {
      const networksName = Object.keys(networks)

      networksName.forEach((netName) => {
        authorizedMACs.forEach((mac) => {
          if (mac === networks[netName]['mac']) {
            setRunApp(true)
          }
        })
      })
    })
  })

  //---------------------- HANDLERS --------------------------
  function clearFieldsHandler() {
    setDados(initialDados)
  }

  function incluirAlunoHandler() {
    if (runApp) {
      const data = dados.dataNasc
      const errorTitle = 'Erro ao Incluir Aluno'

      if ([dados.nomeAluno, data, dados.ra].includes('')) {
        showMessage(msgError.emptyFields, errorTitle, 'error')
      } else if (!validateDateLength(data)) {
        console.log(data)
        showMessage(msgError.wrongDate, errorTitle, 'error')
      } else {
        const month = parseInt(data.substr(3, 2), 10)
        const year = parseInt(data.substr(6, 4), 10)
        const currentYear = new Date().getFullYear()

        if (year < 2000 || year > currentYear - 5) {
          const errorMsg = `${msgError.wrongYear} ${msgError.correction}`
          showMessage(errorMsg, errorTitle, 'error')
        } else if (!validateDate(dados.dataNasc)) {
          if (month < 1 || month > 12) {
            const errorMsg = `${msgError.wrongMonth} ${msgError.correction}`
            showMessage(errorMsg, errorTitle, 'error')
          } else {
            const errorMsg = `${msgError.wrongDay} ${msgError.correction}`
            showMessage(errorMsg, errorTitle, 'error')
          }
        } else {
          const values = createValuesPost()

          const msg = createQuestionMessage(values)

          console.log(values);
          showMessage(msg, 'Incluir Aluno(a)', 'question', values)
        }
      }
    } else {
      showMessage(msgError.macNotAuthorized, 'Erro de Permissão', 'error')
    }
  }

  function incluirAlunoExcelHandler() {
    const dictPath = process.cwd()
    const fileName = 'RM_2020_base.xlsx'
    const filePath = `${dictPath}/${fileName}`

    readXlsxFile(filePath).then((rows) => {
      rows.forEach((row, index) => {
        const norm = normalize(row)
        const newRa = parseInt(index + 1, 10)

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

  function searchAlunoHandler() {
    if (runApp) {
      const values = createValuesSelect(
        dados.ra,
        dados.nomeAluno,
        dados.dataNasc,
        dados.nomeMae
      )

      setPage(0)
      selectAlunos(values)
    } else {
      showMessage(msgError.macNotAuthorized, 'Erro de Permissão', 'error')
    }
  }

  //---------------------- DATABASE QUERIES --------------------------
  function postAluno(values, title) {
    sendAsync('INSERT', values).then((res) => {
      if (res.includes('UNIQUE')) {
        alert(res)
        const errorMsg = `${msgError.unique} ${msgError.correction}`
        showMessage(errorMsg, title, 'error')
      } else if (res.includes('ERROR')) {
        showMessage(res, title, 'error')
      } else {
        selectAlunos(createValuesSelect(dados.ra))
        showMessage(res, title, 'info')
        clearFieldsHandler()
      }
    })
  }

  function selectAlunos(values) {
    const msgTitle = 'Pesquisar Aluno'

    sendAsync('SELECT', values).then((resp) => {
      if (resp.includes('ERROR')) {
        showMessage(resp, msgTitle, 'error')
      } else {
        if (resp.length === 0) {
          showMessage('Nenhum aluno encontrado!', msgTitle, 'info')
        }
        setAlunos(resp)
      }
    })
  }

  //---------------------- CREATORS --------------------------
  function createQuestionMessage(values) {
    return `Confira os dados abaixo:
    Aluno: ${values[0]}
    Nasc.:  ${values[2]}
    RA.:      ${applyMask(values[3], 'ra')}
    Mãe:    ${values[4] || 'NÃO INFORMADA'}\n
    Os dados estão corretos?`
  }

  function createValuesPost() {
    const aluno = capitalize(dados.nomeAluno)
    const mae = capitalize(dados.nomeMae) || 'NÃO INFORMADO'

    return [
      aluno,
      normalize(aluno),
      dados.dataNasc,
      treatRa(dados.ra),
      mae,
      normalize(mae),
    ]
  }

  function createValuesSelect(ra, aluno = '', nasc = '', mae = '') {
    return [
      `${normalize(aluno)}%`,
      `${nasc}%`,
      `${treatRa(ra)}%`,
      `${normalize(mae)}%`,
    ]
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

  //---------------------- TRANSFORMERS --------------------------
  function applyMask(value, type) {
    switch (type) {
      case 'ra':
        return StringMask.apply(value, '000.000.000-A', { reverse: true })

      case 'rm':
        return StringMask.apply(value, '###.##0', { reverse: true })
    }
  }

  function capitalize(text) {
    //split the given string into an array of strings
    //whenever a blank space is encountered
    let arr = String(text).split(' ')

    // remove empty strings from array
    arr = arr.filter(item => item)

    //loop through each element of the array and capitalize the first
    //letter if it have more than 2 chars. If it have less than that, all
    //letters will go to lower case
    const textCapitalized = []

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

  function normalize(text) {
    return String(text)
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[`´'"]/g, '')
      .toLowerCase()
  }

  function treatRa(value) {
    return String(value).replace(/[\W_]/g, '').toUpperCase()
  }

  //---------------------- VALIDATORS --------------------------
  function validateDate(date) {
    return RegExp(
      /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g
    ).test(date)
  }

  function validateDateLength(date) {
    return RegExp(/[\w\/]{10}/g).test(date)
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

        <Button className='button' id='pesquisar' onClick={searchAlunoHandler}>
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
          page={page}
          pageSize={5}
          onPageChange={(newPage) => setPage(newPage.page)}
          rows={alunos}
          rowHeight={45}
        />
      </div>
    </div>
  )
}
