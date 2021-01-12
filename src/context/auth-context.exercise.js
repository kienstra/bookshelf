import * as React from 'react'

const AuthContext = React.createContext()
const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used inside AuthContext.Provider')
  }

  return context
}

export {AuthContext, useAuth}
