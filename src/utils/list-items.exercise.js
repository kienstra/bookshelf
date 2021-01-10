import {useMutation, useQuery, useQueryClient} from 'react-query'
import {client} from 'utils/api-client'

const queryKey = 'list-items'

function useListItem(user, bookId) {
  const listItems = useListItems(user)
  return listItems.find(item => item.bookId === bookId) ?? null
}

function useListItems(user) {
  const {data: listItems} = useQuery(
    queryKey,
    () => {
      return client('list-items', {token: user.token})
        .then(data => data.listItems)
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

        const newListItems = previousListItems.map(listItem => {
          if (listItem.id === newItem.id) {
            return {...listItem, ...newItem}
          }
          return listItem
        })

        // Optimistic update.
        queryClient.setQueryData(queryKey, () => newListItems)

        return {previousListItems}
      },
      onError: (err, newListItems, context) => {
        queryClient.setQueryData(queryKey, context.previousListItems)
      },
      onSettled: () => queryClient.invalidateQueries(queryKey),
      ...options,
    }
  )
}

function useRemoveListItem(user, options = {}) {
  const queryClient = useQueryClient()
  return useMutation(
    ({id}) => client(`list-items/${id}`, {method: 'DELETE', token: user.token}),
    {
      onSettled: () => queryClient.invalidateQueries(queryKey),
      ...options
    }
  )
}

function useCreateListItem(user, options = {}) {
  const queryClient = useQueryClient()
  return useMutation(
    ({bookId}) => client('list-items', {token: user.token, data: {bookId}}),
    {
      onSettled: () => queryClient.invalidateQueries(queryKey),
      ...options
    }
  )
}

export {useCreateListItem, useListItem, useListItems, useRemoveListItem, useUpdateListItem}
