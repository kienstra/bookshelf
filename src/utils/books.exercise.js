import {useQuery} from 'react-query'
import {client} from 'utils/api-client'

function useBook(bookId, user) {
  const {data: book} = useQuery(
    ['book', {bookId}],
    () => client(`books/${bookId}`, {token: user.token}).then(data => data.book)
  )

  return book
}

function useBookSearch(query, user) {
  return useQuery(
    ['bookSearch', {query}],
    () => {
      return client(`books?query=${encodeURIComponent(query)}`, {
        token: user.token,
      }).then(data => data.books)
    }
  )
}

export {useBook, useBookSearch}
