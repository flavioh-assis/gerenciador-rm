import React, { useState } from 'react'
import { Button, TextField } from '@material-ui/core'
const { dialog } = require('electron').remote

export default () => {
  const [nomeAluno, setNomeAluno] = useState('')
  const [dataNasc, setDataNasc] = useState('')
  const [ra, setRA] = useState('')
  const [nomeMae, setNomeMae] = useState('')

  const columns = [
    { field: 'rm', headerName: 'RM', width: 50 },
    {
      field: 'aluno',
      headerName: 'Aluno',
      width: 205,
      headerAlign: 'center',
    },
    {
      field: 'data_nasc',
      headerName: 'Data Nascimento',
      width: 170,
      headerAlign: 'center',
    },
    {
      field: 'mae',
      headerName: 'Nome da Mãe',
      width: 205,
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

    </div>
  )
}
