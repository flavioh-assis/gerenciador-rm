import React, { useState } from 'react'
import { Button, TextField } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid'
const { dialog } = require('electron').remote

export default () => {
  const [nomeAluno, setNomeAluno] = useState('')
  const [dataNasc, setDataNasc] = useState('')
  const [ra, setRA] = useState('')
  const [nomeMae, setNomeMae] = useState('')
  const [alunos, setAlunos] = useState([])

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
      field: 'aluno',
      flex: 1,
      headerName: 'Nome do Aluno',
      headerAlign: 'center',
    },
    {
      align: 'center',
      field: 'data_nasc',
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
      field: 'mae',
      flex: 1,
      headerName: 'Nome da Mãe',
      headerAlign: 'center',
    },
  ]

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

        <TextField
          id='dataNasc'
          label='Data de Nascimento'
          onChange={(t) => setDataNasc(t.target.value)}
          value={dataNasc}
          variant='outlined'
        />

        <TextField
          id='ra'
          label='R.A.'
          onChange={(t) => setRA(t.target.value)}
          value={ra}
          variant='outlined'
        />

        <TextField
          id='nomeMae'
          label='Nome da Mãe'
          onChange={(t) => setNomeMae(t.target.value)}
          value={nomeMae}
          variant='outlined'
        />
      </div>
      <div className='buttons'>
        <Button
          className='button'
          id='incluir'
          onClick={() => showMessage('Incluir', 'OK', 'info')}>
          Incluir Aluno
        </Button>

        <Button
          className='button'
          id='pesquisar'
          onClick={() => showMessage('Pesquisar', 'OK', 'info')}>
          Pesquisar Aluno
        </Button>

        <Button
          className='button'
          id='limpar'
          onClick={() => showMessage('Limpar', 'OK', 'info')}>
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
