import * as React from 'react'
import {useQueryClient, useQuery} from 'react-query'
import {client} from 'utils/api-client'
import bookPlaceholderSvg from 'assets/book-placeholder.svg'

function useBook(bookId, user) {
  const {data} = useQuery(
    ['book', {bookId}],
    () => client(`books/${bookId}`, {token: user.token}).then(data => data.book)
  )

  return data ?? loadingBook
}

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

function getBookSearchConfig(user, query) {
  return [
    ['bookSearch', {query}],
    () => {
      return client(`books?query=${encodeURIComponent(query)}`, {
        token: user.token,
      }).then(data => data.books)
    }
  ]
}

function useBookSearch(query, user) {
  const result = useQuery(...getBookSearchConfig(user, query))

  return {...result, books: result.data ?? loadingBooks}
}

function useBookRefetch(user) {
  const queryClient = useQueryClient()

  const refetchBookSearchQuery = React.useCallback( () => {
    queryClient.removeQueries('bookSearch')
    queryClient.prefetchQuery(...getBookSearchConfig(user, ''))
  }, [queryClient, user] )

  return {refetchBookSearchQuery}
}


export {useBookRefetch, useBook, useBookSearch}
