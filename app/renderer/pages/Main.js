import React, { useState } from 'react'

import FieldsTable from '../components/Fields&Table'
import ImpExpExcel from '../components/ImportExportExcel'
const Header = '../../app/assets/images/header_mvmi.png'

export default () => {
  const [isMainPage, setIsMainPage] = useState(false)

  return (
    <div className='container'>
      <div className='page'>
        <div className='titulo'>
          <img
            id='header'
            onClick={() => setIsMainPage(!isMainPage)}
            src={Header}
            title={isMainPage ? 'Importar/Exportar dados' : 'Voltar ao início'}
          />
          <p id='title'>GERENCIADOR DE RM</p>
        </div>

        {isMainPage ? <FieldsTable /> : <ImpExpExcel />}
      </div>
    </div>
  )
}
