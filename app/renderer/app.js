import React from 'react'
import { HashRouter, Route } from 'react-router-dom'
import Main from './pages/Main'

export default () => (
  <HashRouter>
    <Route path='/' exact={true} component={Main} />
  </HashRouter>
)
