import React from 'react'
import FieldsTable from '../components/Fields&Table'

const Header = '../../app/assets/images/header_mvmi.png'

export default () => {
  return (
    <div className='container'>
      <div className='page'>
        <div className='titulo'>
          <img
            alt='EMEB. "Maria Virgínia Matarazzo Ippólito'
            id='header'
            src={Header}
          />
          <p id='title'>GERENCIADOR DE RM</p>
        </div>

        <FieldsTable />
      </div>
    </div>
  )
}
