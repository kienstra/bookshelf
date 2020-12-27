import * as React from 'react'
import {render} from 'react-dom'
import {Logo} from 'components/logo'
import {LoginButton} from 'components/login-button'
import { RegisterButton } from 'components/register-button'

function App() {
  return (
    <>
      <Logo />
      <h1>Bookshelf</h1>
      <LoginButton />
      <RegisterButton />
    </>
  )
}

render(
  <App />,
  document.getElementById('root')
)
