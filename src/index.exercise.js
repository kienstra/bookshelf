/** @jsx jsx */
import {jsx} from '@emotion/core'
import * as React from 'react'
import 'bootstrap/dist/css/bootstrap-reboot.css'
import '@reach/dialog/styles.css'
import ReactDOM from 'react-dom'
import {Button, Input, FormGroup} from './components/lib'
import {Modal, ModalContents, ModalOpenButton} from './components/modal'
import {Logo} from './components/logo'

function LoginForm({onSubmit, submitButton}) {
  function handleSubmit(event) {
    event.preventDefault()
    const {username, password} = event.target.elements

    onSubmit({
      username: username.value,
      password: password.value,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        '> div': {
          margin: '10px auto',
          width: '100%',
          maxWidth: '300px',
        },
      }}
    >
      <FormGroup>
        <div>
          <label htmlFor="username">Username</label>
          <Input id="username" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <Input id="password" type="password" />
        </div>
        <div>{React.cloneElement(submitButton, {type: 'submit'})}</div>
      </FormGroup>
    </form>
  )
}

function App() {
  function login(formData) {
    console.log('login', formData)
  }

  function register(formData) {
    console.log('register', formData)
  }

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100vh',
      }}
    >
      <Logo width="80" height="80" />
      <h1>Bookshelf</h1>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gridGap: '0.75rem',
        }}
      >
        <Modal>
          <ModalOpenButton>
            <Button variant="primary">Login</Button>
          </ModalOpenButton>
          <ModalContents aria-label="Login form" title="Login">
            <LoginForm
              onSubmit={login}
              submitButton={<Button variant="primary">Login</Button>}
            />
          </ModalContents>
        </Modal>
        <Modal>
          <ModalOpenButton>
            <Button variant="secondary">Register</Button>
          </ModalOpenButton>
          <ModalContents aria-label="Registration form" title="Register">
            <LoginForm
              onSubmit={register}
              submitButton={<Button variant="secondary">Register</Button>}
            />
          </ModalContents>
        </Modal>
      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
