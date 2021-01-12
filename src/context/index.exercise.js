import * as React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from 'react-query'
import {AuthContext} from 'context/auth-context'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      useErrorBoundary: true,
      refetchOnWindowFocus: false,
      retry(failureCount, error) {
        if (error.status === 404) return false
        if (failureCount > 2) return true
        return false
      }
    },
    mutations: {},
  },
})

const AppProviders = ({children, authValue}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <Router>
          {children}
        </Router>
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}

export {AppProviders}
