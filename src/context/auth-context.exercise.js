import * as React from 'react'

const AuthContext = React.createContext()
const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('The useAuth() hook must be called inside AuthContext.Provider')
  }

  return context
}

export {AuthContext, useAuth}
