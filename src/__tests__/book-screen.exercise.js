import * as React from 'react'
import{render, screen, userEvent, waitForLoadingToFinish} from 'test/app-test-utils'
import * as booksDB from 'test/data/books'
import faker from 'faker'
import {buildBook} from 'test/generate'
import {formatDate} from 'utils/misc'
import {App} from 'app'

async function renderBookScreen({user, book} = {}) {
  book = typeof book === 'undefined' ? await booksDB.create(buildBook()) : book
  const route = `/book/${book.id}`
  const renderResult = await render(<App />, {route, user})

  return {...renderResult, book}
}

test('renders all the book information', async () => {
  const {book, user} = await renderBookScreen()

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
  await renderBookScreen()

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

test('can remove a list item for the book', async () => {
  await renderBookScreen()

  const addToListButton = screen.getByRole('button', {name: /add to list/i})
  userEvent.click(addToListButton)
  await waitForLoadingToFinish()

  userEvent.click(screen.getByRole('button', {name: /remove from list/i}))
  await waitForLoadingToFinish()
  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
})

test('can mark a list item as read', async () => {
  await renderBookScreen()

  userEvent.click(screen.getByRole('button', {name: /add to list/i}))
  await waitForLoadingToFinish()

  userEvent.click(screen.getByRole('button', {name: /mark as read/i}))
  await waitForLoadingToFinish()

  screen.getAllByRole('radio',{name: /star/i})
  expect(screen.queryByRole('button', {name: /mark as read/i})).not.toBeInTheDocument()
  expect(screen.queryByRole('button', {name: /mark as unread/i})).toBeInTheDocument()

  const startAndFinishDateNode = screen.getByLabelText(/start and finish date/i)
  expect(startAndFinishDateNode).toHaveTextContent(formatDate(Date.now()))
})

test('can edit a note', async () => {
  jest.useFakeTimers()
  await renderBookScreen()

  userEvent.click(screen.getByRole('button', {name: /add to list/i}))
  await waitForLoadingToFinish()

  const noteBox = screen.getByRole('textbox', {name: /notes/i})
  const noteText = faker.lorem.words()
  userEvent.clear(noteBox)
  userEvent.type(noteBox, noteText)

  await screen.findByLabelText(/loading/i)
  await waitForLoadingToFinish()

  expect(noteBox).toHaveValue(noteText)
})
