import {useQuery, useMutation, useQueryClient} from 'react-query'
import {useAuth, useClient} from 'context/auth-context'
import {setQueryDataForBook} from './books'
import {client} from './api-client'

function useListItems() {
  const queryClient = useQueryClient()
  const {authenticatedClient} = useClient()

  const {data} = useQuery(
    'list-items',
    () => authenticatedClient(`list-items`).then(data => data.listItems),
    {
      onSuccess: async listItems => {
        for (const listItem of listItems) {
          setQueryDataForBook(listItem.book, queryClient)
        }
      },
    },
  )

  return data ?? []
}

function useListItem(bookId) {
  const listItems = useListItems()
  return listItems.find(li => li.bookId === bookId) ?? null
}

const getDefaultMutationOptions = (queryClient) => ( {
  onError: (err, variables, recover) =>
    typeof recover === 'function' ? recover() : null,
  onSettled: () => queryClient.invalidateQueries('list-items'),
} )

function useUpdateListItem(options) {
  const {authenticatedClient} = useClient()
  const queryClient = useQueryClient()

  return useMutation(
    updates =>
      authenticatedClient(`list-items/${updates.id}`, {
        method: 'PUT',
        data: updates,
      }),
    {
      onMutate(newItem) {
        const previousItems = queryClient.getQueryData('list-items')

        queryClient.setQueryData('list-items', old => {
          return old.map(item => {
            return item.id === newItem.id ? {...item, ...newItem} : item
          })
        })

        return () => queryClient.setQueryData('list-items', previousItems)
      },
      ...getDefaultMutationOptions(queryClient),
      ...options,
    },
  )
}

function useRemoveListItem(options) {
  const {authenticatedClient} = useClient()
  const queryClient = useQueryClient()

  return useMutation(
    ({id}) => authenticatedClient(`list-items/${id}`, {method: 'DELETE'}),
    {
      onMutate(removedItem) {
        const previousItems = queryClient.getQueryData('list-items')

        queryClient.setQueryData('list-items', old => {
          return old.filter(item => item.id !== removedItem.id)
        })

        return () => queryClient.setQueryData('list-items', previousItems)
      },
      ...getDefaultMutationOptions(queryClient),
      ...options,
    },
  )
}

function useCreateListItem(options) {
  const {authenticatedClient} = useClient()
  const queryClient = useQueryClient()

  return useMutation(
    ({bookId}) => authenticatedClient(`list-items`, {data: {bookId}}),
    {...getDefaultMutationOptions(queryClient), ...options},
  )
}

export {
  useListItem,
  useListItems,
  useUpdateListItem,
  useRemoveListItem,
  useCreateListItem,
}
