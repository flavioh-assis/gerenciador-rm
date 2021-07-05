import React from 'react'
import FieldsTable from '../components/Fields&Table'

export default () => {
  return (
    <div className='container'>
      <div className='page'>
        <div className='titulo'>
          <p id='title'>GERENCIADOR DE RM</p>

          <FieldsTable />
        </div>
      </div>
    </div>
  )
}
