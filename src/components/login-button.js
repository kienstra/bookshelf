import * as React from 'react'

const LoginButton = () => {
  return (
    <button onClick={ () => console.log('Clicked login button')}>
      Log in
    </button>
  )
}

export {LoginButton}
