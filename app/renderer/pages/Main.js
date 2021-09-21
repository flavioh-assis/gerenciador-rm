import React from 'react'
import FieldsTable from '../components/Fields&Table'
import ImportExportExcel from '../components/ImportExportExcel'
const { dialog } = require('electron').remote

const Header = '../../app/assets/images/header_mvmi.png'

export default () => {
  function importExportExcel() {
    dialog.showMessageBox({
      title: 'Teste',
      message: 'Teste',
      type: 'question',
    })
  }
  
  return (
    <div className='container'>
      <div className='page'>
        <div className='titulo'>
          <img
            alt='EMEB. Maria Virgínia Matarazzo Ippólito'
            id='header'
            onClick={importExportExcel}
            src={Header}
            title='Exportar/Importar dados'
          />
          <p id='title'>GERENCIADOR DE RM</p>
        </div>

        <FieldsTable />
      </div>
    </div>
  )
}
