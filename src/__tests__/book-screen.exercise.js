import * as React from 'react'
import {render as renderComponent, screen, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {queryCache} from 'react-query'
import * as usersDB from 'test/data/users'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
import * as auth from 'auth-provider'
import {buildUser, buildBook} from 'test/generate'
import {formatDate} from 'utils/misc'
import {AppProviders} from 'context'
import {App} from 'app'

afterEach(async () => {
  queryCache.clear()
  await Promise.all([
    auth.logout(),
    usersDB.reset(),
    booksDB.reset(),
    listItemsDB.reset(),
  ])
})

async function loginAsUser(userProperties) {
  const user = buildUser(userProperties)
  await usersDB.create(user)
  const authUser = await usersDB.authenticate(user)
  window.localStorage.setItem(auth.localStorageKey, authUser.token)

  return user
}

async function render(ui, {route = '/list', user, ...renderOptions }= {}) {
  user = typeof user === 'undefined' ? await loginAsUser() : user

  window.history.pushState({}, 'Test page', route)
  const rendered = renderComponent(ui, {wrapper: AppProviders, ...renderOptions})
  await waitForLoadingToFinish()
  return {...rendered, user}
}

const waitForLoadingToFinish = () => waitForElementToBeRemoved(() => [
  ...screen.queryAllByLabelText(/loading/i),
  ...screen.queryAllByText(/loading/i),
])

test('renders all the book information', async () => {
  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`
  const {user} = await render(<App />, {route})

  expect(screen.getByText(user.username)).toBeInTheDocument()
  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
  expect(screen.getByRole('img', {name: /book cover/i})).toHaveAttribute(
    'src',
    book.coverImageUrl
  )

  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('textbox', {name: /notes/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
})

test('can create a list item for the book', async () => {
  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`
  await render(<App />, {route})

  const addToListButton = screen.getByRole('button', {name: /add to list/i})
  userEvent.click(addToListButton)
  expect(addToListButton).toBeDisabled()
  await waitForLoadingToFinish()

  expect(screen.getByRole('button', {name: /mark as read/i})).toBeInTheDocument()
  expect(screen.queryByRole('button', {name: /mark as unread/i})).not.toBeInTheDocument()
  expect(screen.getByRole('button', {name: /remove from list/i})).toBeInTheDocument()
  expect(screen.queryByRole('button',{name: /add to list/i})).not.toBeInTheDocument()

  expect(screen.getByLabelText(/start date/i)).toHaveTextContent(formatDate(new Date()))
  expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
  expect(screen.queryByRole('radio',{name: /star/i})).not.toBeInTheDocument()
})
