import React, { useState } from 'react'
import { Button, TextField } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid'
const { dialog } = require('electron').remote
import InputMask from 'react-input-mask'
import sendAsync from '../../../app/api/renderer'

export default () => {
  const [nomeAluno, setNomeAluno] = useState('')
  const [dataNasc, setDataNasc] = useState('')
  const [ra, setRA] = useState('')
  const [nomeMae, setNomeMae] = useState('')
  const [alunos, setAlunos] = useState([])
  const values = [`${nomeAluno}`, `${dataNasc}`, `${ra}`, `${nomeMae}`]
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
    sendAsync('INSERT', values).then((res) => {
      if (res.includes('ERROR')) {
        showMessage(res, 'Incuir Aluno', 'error')
      } else {
        showMessage(res, 'Incuir Aluno', 'info')
        clearFields()
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

        <Button
          className='button'
          id='pesquisar'
          onClick={() => showMessage('Pesquisar', 'OK', 'info')}>
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
