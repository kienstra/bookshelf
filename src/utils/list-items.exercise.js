import {useMutation, useQuery, useQueryClient} from 'react-query'
import {client} from 'utils/api-client'
import { setQueryDataForBook } from './books.extra-6'

const queryKey = 'list-items'

const getDefaultMutationOptions = (queryClient) => ({
  onError: (err, newListItems, recover) => {
    if (typeof recover === 'function')
    recover()
  },
  onSettled: () => queryClient.invalidateQueries(queryKey),
})

function useListItem(user, bookId) {
  const listItems = useListItems(user)
  return listItems.find(item => item.bookId === bookId) ?? null
}

function useListItems(user) {
  const queryClient = useQueryClient()
  const {data: listItems} = useQuery(
    queryKey,
    () => {
      return client('list-items', {token: user.token})
        .then(data => data.listItems)
    },
    {
      onSuccess(items) {
        items.forEach( item => {
          if (item.book) {
            setQueryDataForBook(item.book, queryClient)
          }
        })
      }
    }
  )

  return listItems ?? []
}

function useUpdateListItem(user, options = {}) {
  const queryClient = useQueryClient()
  return useMutation(
    data => client(`list-items/${data.id}`, {method: 'PUT', token: user.token, data}),
    {
      onMutate: async newItem => {
        await queryClient.cancelQueries(queryKey)
        const previousListItems = queryClient.getQueryData(queryKey)

        // Optimistic update.
        queryClient.setQueryData(queryKey, previousListItems => {
          return previousListItems.map(listItem => {
            return listItem.id === newItem.id ? {...listItem, ...newItem} : listItem
          })
        })

        return () => queryClient.setQueryData(queryKey, previousListItems)
      },
      ...getDefaultMutationOptions(queryClient),
      ...options,
    }
  )
}

function useRemoveListItem(user, options = {}) {
  const queryClient = useQueryClient()
  return useMutation(
    ({id}) => client(`list-items/${id}`, {method: 'DELETE', token: user.token}),
    {
      onMutate: removedItem => {
        queryClient.cancelQueries(queryKey)
        const previousListItems = queryClient.getQueryData(queryKey)

        // Optimistic update.
        queryClient.setQueryData(queryKey, previousListItems => {
          return previousListItems.filter(previousItem => {
            return removedItem.id !== previousItem.id
          })
        })

        return () => queryClient.setQueryData(queryKey, previousListItems)
      },
      ...getDefaultMutationOptions(queryClient),
      ...options
    }
  )
}

function useCreateListItem(user, options = {}) {
  const queryClient = useQueryClient()
  return useMutation(
    ({bookId}) => client('list-items', {token: user.token, data: {bookId}}),
    {
      onMutate: async newItem => {
        await queryClient.cancelQueries(queryKey)
        const previousListItems = queryClient.getQueryData(queryKey)

        // Optimistic update.
        queryClient.setQueryData(queryKey, previousListItems => {
          return [...previousListItems, newItem]
        })

        return () => queryClient.setQueryData(queryKey, previousListItems)
      },
      ...getDefaultMutationOptions(queryClient),
      ...options
    }
  )
}

export {useCreateListItem, useListItem, useListItems, useRemoveListItem, useUpdateListItem}
