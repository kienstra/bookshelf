import {render as renderComponent, screen, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {buildUser} from 'test/generate'
import * as usersDB from 'test/data/users'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'

async function loginAsUser(userProperties) {
  const user = buildUser(userProperties)
  await usersDB.create(user)
  const authUser = await usersDB.authenticate(user)
  window.localStorage.setItem(auth.localStorageKey, authUser.token)

  return user
}

async function render(ui, {route = '/list', user, ...renderOptions }= {}) {
  window.history.pushState({}, 'Test page', route)
  const returnValue = {
    ...renderComponent(ui, {wrapper: AppProviders, ...renderOptions}),
    user,
  }
  await waitForLoadingToFinish()

  return returnValue
}

const waitForLoadingToFinish = () => waitForElementToBeRemoved(() => [
  ...screen.queryAllByLabelText(/loading/i),
  ...screen.queryAllByText(/loading/i),
])

export * from '@testing-library/react'
export {render, userEvent, loginAsUser, waitForLoadingToFinish}
