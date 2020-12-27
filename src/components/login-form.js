import * as React from 'react'

const LoginForm = ({onSubmit, buttonText}) => {
  const [formFields, setFormFields] = React.useState({userName: '', password: ''})
  return (
    <form>
      <div>
        <label htmlFor="login-username">User name</label>
        <input
          id="login-username"
          type="text"
          value={formFields.username}
          onChange={event => {
            setFormFields( {
              ...formFields,
              userName: event.target.value
            })
          }}
        />
      </div>
      <div>
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="text"
          value={formFields.password}
          onChange={event => {
            setFormFields( {
              ...formFields,
              password: event.target.value
            })
          }}
        />
      </div>
      <button
        onClick={event => {
          event.preventDefault()
          onSubmit(formFields)
        } }
      >
        {buttonText}
      </button>
    </form>
  )
}

export {LoginForm}
