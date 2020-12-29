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

  async function getUser() {
    const token = await auth.getToken()
    if (token) {
      const data = await client('me', {token});
      return data.user
    }

    return null;
  }

  React.useEffect(() => {
    getUser().then(user => setUser(user))
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
