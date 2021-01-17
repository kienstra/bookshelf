import {loadDevTools} from './dev-tools/load'
import './bootstrap'
import * as React from 'react'
import ReactDOM from 'react-dom'
import {App} from './app'
import {Profiler} from './components/profiler'
import {AppProviders} from './context'

loadDevTools(() => {
  ReactDOM.render(
    <Profiler id="AppProviders">
      <AppProviders>
        <App />
      </AppProviders>
    </Profiler>,
    document.getElementById('root'),
  )
})
