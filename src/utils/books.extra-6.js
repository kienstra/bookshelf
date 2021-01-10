import {useQuery, useQueryClient} from 'react-query'
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
        setQueryDataForBook(book, queryClient)
      }
    },
  },
})

function useBookSearch(query, user) {
  const queryClient = useQueryClient()
  const result = useQuery(getBookSearchConfig(query, user, queryClient))
  return {...result, books: result.data ?? loadingBooks}
}

function useBook(bookId, user) {
  const {data} = useQuery({
    queryKey: ['book', {bookId}],
    queryFn: () =>
      client(`books/${bookId}`, {token: user.token}).then(data => data.book),
  })
  return data ?? loadingBook
}

async function refetchBookSearchQuery(user, queryClient) {
  queryClient.removeQueries('bookSearch')
  await queryClient.prefetchQuery(getBookSearchConfig('', user))
}

function setQueryDataForBook(book, queryClient) {
  queryClient.setQueryData(['book', {bookId: book.id}], book)
}

export {useBook, useBookSearch, refetchBookSearchQuery, setQueryDataForBook}
