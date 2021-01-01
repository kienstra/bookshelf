import {loadDevTools} from './dev-tools/load'
import './bootstrap'
import * as React from 'react'
import {QueryClient, QueryClientProvider} from 'react-query'
import ReactDOM from 'react-dom'
import {App} from './app'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      useErrorBoundary: true,
      refetchOnWindowFocus: false,
    },
    mutations: {},
  },
})

loadDevTools(() => {
  ReactDOM.render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
    document.getElementById('root')
  )
})
