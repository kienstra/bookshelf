import * as React from 'react'
import {render} from 'react-dom'
import VisuallyHidden from "@reach/visually-hidden";
import {Dialog} from '@reach/dialog'
import '@reach/dialog/styles.css';

import {Logo} from 'components/logo'
import {LoginButton} from 'components/login-button'
import {LoginForm} from 'components/login-form'
import { RegisterButton } from 'components/register-button'

function App() {
  const possibleOpenModals = {
    login: 'login',
    register: 'register',
    none: 'none',
  }

  const [openModal, setOpenModal] = React.useState(possibleOpenModals.none)
  const closeDialog = () => setOpenModal(possibleOpenModals.none)
  function handleSubmit(formData) {
    console.log('login', formData)
  }

  return (
    <>
      <Logo />
      <h1>Bookshelf</h1>
      <div>
        <LoginButton onClick={ () => setOpenModal(possibleOpenModals.login) } />
      </div>
      <div>
        <RegisterButton onClick={ () => setOpenModal(possibleOpenModals.register) }/>
      </div>
      <Dialog
        isOpen={openModal === possibleOpenModals.login}
        onDismiss={closeDialog}
        aria-label="Log in for app"
      >
        <button className="close-button-login" onClick={closeDialog}>
          <VisuallyHidden>Close</VisuallyHidden>
          <span aria-hidden>×</span>
        </button>
        <h1>Log in</h1>
        <LoginForm onSubmit={handleSubmit} buttonText="Login" />
      </Dialog>
      <Dialog
        isOpen={openModal === possibleOpenModals.register}
        onDismiss={closeDialog}
        aria-label="Register for app"
      >
        <button className="close-button-register" onClick={closeDialog}>
          <VisuallyHidden>Close</VisuallyHidden>
          <span aria-hidden>×</span>
        </button>
        <h1>Register</h1>
        <LoginForm onSubmit={handleSubmit} buttonText="Register" />
      </Dialog>
    </>
  )
}

render(
  <App />,
  document.getElementById('root')
)
