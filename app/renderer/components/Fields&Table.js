import React, { useState } from 'react'
import { Button, TextField } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid'
import InputMask from 'react-input-mask'
import sendAsync from '../../../app/api/renderer'
const { dialog } = require('electron').remote

export default () => {
  const [nomeAluno, setNomeAluno] = useState('')
  const [dataNasc, setDataNasc] = useState('')
  const [ra, setRA] = useState('')
  const [nomeMae, setNomeMae] = useState('')
  const [alunos, setAlunos] = useState([])
  const msgError = {
    insert:
      'Os campos "NOME DO ALUNO", "DATA DE NASCIMENTO" e "RA" precisam ser preenhidos.',
  }
  const columns = [
    {
      align: 'center',
      field: 'id',
      headerName: 'RM',
      width: 80,
      headerAlign: 'center',
    },
    {
      align: 'center',
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
    },
    {
      align: 'center',
      field: 'ra',
      headerName: 'R.A.',
      width: 180,
      headerAlign: 'center',
    },
    {
      align: 'center',
      field: 'nomeMae',
      flex: 1,
      headerName: 'Nome da Mãe',
      headerAlign: 'center',
    },
  ]

  function clearFields() {
    setNomeAluno('')
    setDataNasc('')
    setRA('')
    setNomeMae('')
  }

  function insertAluno() {
    if (''.includes(nomeAluno, dataNasc, ra)) {
      showMessage(msgError.insert, 'Erro ao Incluir Aluno', 'error')
    } else {
      let newRA = treatRaValue()

      const values = [
        `${nomeAluno}`,
        `${dataNasc.replace(/\D+/g, '')}`,
        `${newRA}`,
        `${nomeMae}`,
      ]

      sendAsync('INSERT', values).then((res) => {
        if (res.includes('ERROR')) {
          showMessage(res, 'Incuir Aluno', 'error')
        } else {
          showMessage(res, 'Incuir Aluno', 'info')
          clearFields()
        }
      })
    }
  }

  function searchAluno() {
    let newRA = treatRaValue()

    const values = [
      `${nomeAluno}%`,
      `${dataNasc.replace(/\D+/g, '')}%`,
      `${newRA}`,
      `${nomeMae}%`,
    ]

    sendAsync('SELECT', values).then((resp) => {
      if (resp.includes('ERROR')) {
        showMessage(resp, 'Pesquisar Aluno', 'error')
      } else {
        setAlunos(resp)
      }
    })
  }

  function showMessage(message, title, type) {
    dialog.showMessageBox({
      message,
      title,
      type,
    })
  }

  function treatRaValue() {
    let raUnmasked = ra.replace(/\D+/g, '')
    let dif = 10 - raUnmasked.length

    let newRA = ''

    if (dif == 10) {
      newRA = '%'
    } else if (dif == 0) {
      newRA = raUnmasked
    } else {
      for (let count = 0; count < dif; count++) {
        newRA += '0'
      }
      return (newRA += raUnmasked)
    }
    return newRA
  }

  return (
    <div className='fields_table'>
      <div className='fields'>
        <TextField
          id='nomeAluno'
          label='Nome do Aluno'
          onChange={(t) => setNomeAluno(t.target.value)}
          value={nomeAluno}
          variant='outlined'
        />

        <InputMask
          id='dataNasc'
          onChange={(t) => setDataNasc(t.target.value)}
          mask='99/99/9999'
          value={dataNasc}>
          {() => <TextField label='Data de Nascimento' variant='outlined' />}
        </InputMask>

        <InputMask
          id='ra'
          onChange={(t) => setRA(t.target.value)}
          mask='999.999.999-*'
          value={ra}>
          {() => <TextField label='R.A.' variant='outlined' />}
        </InputMask>

        <TextField
          id='nomeMae'
          label='Nome da Mãe'
          onChange={(t) => setNomeMae(t.target.value)}
          value={nomeMae}
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
          pageSize={10}
          rows={alunos}
          rowHeight={45}
        />
      </div>
    </div>
  )
}
