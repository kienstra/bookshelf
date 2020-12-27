import * as React from 'react'
import {render} from 'react-dom'
import VisuallyHidden from "@reach/visually-hidden";
import {Dialog} from '@reach/dialog'
import '@reach/dialog/styles.css';

import {Logo} from 'components/logo'
import {LoginButton} from 'components/login-button'
import { RegisterButton } from 'components/register-button'

function App() {
  const possibleModalDisplays = {
    login: 'login',
    register: 'register',
    none: 'none',
  }

  const [modalDisplaying, setModalDisplaying] = React.useState(possibleModalDisplays.none)
  const closeDialog = () => setModalDisplaying(possibleModalDisplays.none)

  return (
    <>
      <Logo />
      <h1>Bookshelf</h1>
      <div>
        <LoginButton onClick={ () => setModalDisplaying(possibleModalDisplays.login) } />
      </div>
      <div>
        <RegisterButton onClick={ () => setModalDisplaying(possibleModalDisplays.register) }/>
      </div>
      <Dialog
        isOpen={modalDisplaying === possibleModalDisplays.login}
        onDismiss={closeDialog}
        aria-label="Log in for app"
      >
        <button className="close-button-login" onClick={closeDialog}>
          <VisuallyHidden>Close</VisuallyHidden>
          <span aria-hidden>×</span>
        </button>
        <p>Please log in</p>
      </Dialog>
      <Dialog
        isOpen={modalDisplaying === possibleModalDisplays.register}
        onDismiss={closeDialog}
        aria-label="Register for app"
      >
        <button className="close-button-register" onClick={closeDialog}>
          <VisuallyHidden>Close</VisuallyHidden>
          <span aria-hidden>×</span>
        </button>
        <p>Please register</p>
      </Dialog>
    </>
  )
}

render(
  <App />,
  document.getElementById('root')
)
