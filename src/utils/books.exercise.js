import * as React from 'react'
import {useQuery, useQueryClient} from 'react-query'
import {useClient} from 'context/auth-context'
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

const getBookSearchConfig = (query, client, queryClient) => ({
  queryKey: ['bookSearch', {query}],
  queryFn: () =>
    client(`books?query=${encodeURIComponent(query)}`)
      .then(data => data.books),
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
  const client = useClient()
  const result = useQuery(getBookSearchConfig(query, client, queryClient))
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
  const queryClient = useQueryClient()
  const client = useClient()

  return React.useCallback(async () =>  {
    queryClient.removeQueries('bookSearch')
    await queryClient.prefetchQuery(getBookSearchConfig('', client, queryClient))
  }, [client, queryClient])
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
