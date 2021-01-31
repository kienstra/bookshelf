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

async function loginUser(userProperties) {
  const user = buildUser(userProperties)
  await usersDB.create(user)
  const authUser = await usersDB.authenticate(user)
  window.localStorage.setItem(auth.localStorageKey, authUser.token)

  return user
}

async function render() {
  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`
  window.history.pushState({}, 'Test page', route)
  renderComponent(<App />, {wrapper: AppProviders})

  return book
}

const waitForLoadingToFinish = () => waitForElementToBeRemoved(() => [
  ...screen.queryAllByLabelText(/loading/i),
  ...screen.queryAllByText(/loading/i),
])

test('renders all the book information', async () => {
  const user = await loginUser()
  const book = await render()
  await waitForLoadingToFinish()

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
  await loginUser()
  await render()
  await waitForLoadingToFinish()

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
