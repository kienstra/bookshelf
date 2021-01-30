import * as React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import {queryCache} from 'react-query'
import {buildUser, buildBook} from 'test/generate'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'
import {App} from 'app'

afterEach(() => {
  queryCache.clear()
})

test('renders all the book information', async () => {
  const localStorageToken = 'something'
  window.localStorage.setItem(auth.localStorageKey, localStorageToken)

  const user = buildUser()
  const book = buildBook()
  window.history.pushState({}, 'page title', `book/${book.id}`)

  window.fetch = jest.fn( async (url, config) => {
    return {
      ok: true,
      json: async () => {
        if (url.match(/bootstrap$/)) {
          return {user, listItems: []}
        } else if (url.match(/\/me$/)) {
          return {user}
        } else if (url.match(/\/list-items$/)) {
          return {listItems: []}
        } else if (url.match(RegExp(`/books/${book.id}$`, 'g'))) {
          return {book}
        }
      }
    }
  })

  render(
    <AppProviders>
      <App />
    </AppProviders>
  )

  await waitFor(() => {
    expect(screen.getByText(user.username)).toBeInTheDocument()
    expect(screen.getByText(book.title)).toBeInTheDocument()
    expect(screen.getByText(book.author)).toBeInTheDocument()
    expect(screen.getByText(book.synopsis)).toBeInTheDocument()
    expect(screen.getByText(book.publisher)).toBeInTheDocument()
  })
})

// 🐨 "authenticate" the client by setting the auth.localStorageKey in localStorage to some string value (can be anything for now)
// 🐨 create a user using `buildUser`
// 🐨 create a book use `buildBook`
// 🐨 update the URL to `/book/${book.id}`
//   💰 window.history.pushState({}, 'page title', route)
//   📜 https://developer.mozilla.org/en-US/docs/Web/API/History/pushState

// 🐨 reassign window.fetch to another function and handle the following requests:
// - url ends with `/me`: respond with {user}
// - url ends with `/list-items`: respond with {listItems: []}
// - url ends with `/books/${book.id}`: respond with {book}
// 💰 window.fetch = async (url, config) => { /* handle stuff here*/ }
// 💰 return Promise.resolve({ok: true, json: async () => ({ /* response data here */ })})

// 🐨 render the App component and set the wrapper to the AppProviders
// (that way, all the same providers we have in the app will be available in our tests)

// 🐨 use waitFor to wait for the queryCache to stop fetching and the loading
// indicators to go away
// 📜 https://testing-library.com/docs/dom-testing-library/api-async#waitfor
// 💰 if (queryCache.isFetching or there are loading indicators) then throw an error...

// 🐨 assert the book's info is in the document
