/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
import * as auth from 'auth-provider'
import {AuthenticatedApp} from './authenticated-app'
import {UnauthenticatedApp} from './unauthenticated-app'
import {client} from 'utils/api-client'

function App() {
  const [user, setUser] = React.useState(null)

  const login = form => auth.login(form).then(user => setUser(user))
  const register = form => auth.register(form).then(user => setUser(user))
  const logout = () => {
    auth.logout()
    setUser(null)
  }

  React.useEffect(() => {
    async function getToken() {
      const token = await auth.getToken()
      if (token) {
        client('me', {token}).then(data => {
          setUser(data.user)
          console.log(data.user)
        })
      } else {
        setUser(null)
      }
    }
    getToken()
  },[])

  return user
    ? <AuthenticatedApp user={user} logout={logout} />
    : <UnauthenticatedApp login={login} register={register} />
}

export {App}

/*
eslint
  no-unused-vars: "off",
*/
