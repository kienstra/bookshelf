import * as React from 'react'
import {useQuery, useQueryClient} from 'react-query'
import {useAuth, useClient} from 'context/auth-context'
import {client} from './api-client'
import bookPlaceholderSvg from 'assets/book-placeholder.svg'

const loadingBook = {
  title: 'Loading...',
  author: 'loading...',
  coverImageUrl: bookPlaceholderSvg,
  publisher: 'Loading Publishing',
  synopsis: 'Loading...',
  loadingBook: true,
}

const loadingBooks = Array.from({length: 10}, (v, index) => ({
  id: `loading-book-${index}`,
  ...loadingBook,
}))

const getBookSearchConfig = (query, user, queryClient) => ({
  queryKey: ['bookSearch', {query}],
  queryFn: () =>
    client(`books?query=${encodeURIComponent(query)}`, {
      token: user.token,
    }).then(data => data.books),
  config: {
    onSuccess(books) {
      for (const book of books) {
        queryClient(book)
      }
    },
  },
})

function useBookSearch(query) {
  const queryClient = useQueryClient()
  const {user} = useAuth()
  const result = useQuery(getBookSearchConfig(query, user, queryClient))
  return {...result, books: result.data ?? loadingBooks}
}

function useBook(bookId) {
  const client = useClient()
  const {data} = useQuery({
    queryKey: ['book', {bookId}],
    queryFn: () =>
      client(`books/${bookId}`).then(data => data.book),
  })
  return data ?? loadingBook
}

function useRefetchBookSearchQuery() {
  const {user} = useAuth()
  const queryClient = useQueryClient()

  return React.useCallback(async () =>  {
    queryClient.removeQueries('bookSearch')
    await queryClient.prefetchQuery(getBookSearchConfig('', user, queryClient))
  }, [queryClient, user])
}

const bookQueryConfig = {
  staleTime: 1000 * 60 * 60,
  cacheTime: 1000 * 60 * 60,
}

function setQueryDataForBook(book, queryClient) {
  queryClient.setQueryData({
    queryKey: ['book', {bookId: book.id}],
    queryFn: book,
    ...bookQueryConfig,
  })
}

export {useBook, useBookSearch, useRefetchBookSearchQuery, setQueryDataForBook}
