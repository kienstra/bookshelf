import '@testing-library/jest-dom'
import {server} from 'test/server'
import {queryCache} from 'react-query'
import * as auth from 'auth-provider'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
import * as usersDB from 'test/data/users'

jest.mock('components/profiler')

// enable API mocking in test runs using the same request handlers
// as for the client-side mocking.
beforeAll(() => server.listen())
beforeEach(() => jest.useRealTimers())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

afterEach(async () => {
  server.resetHandlers()
  queryCache.clear()
  await Promise.all([
    auth.logout(),
    usersDB.reset(),
    booksDB.reset(),
    listItemsDB.reset(),
  ])
})
