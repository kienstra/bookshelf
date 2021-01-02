import {useMutation, useQuery, useQueryClient} from 'react-query'
import {client} from 'utils/api-client'

function useListItem(user, bookId) {
  const listItems = useListItems(user)
  return listItems?.find(item => item.bookId === bookId) ?? null
}

function useListItems(user) {
  const {data: listItems} = useQuery(
    'list-items',
    () => {
      return client('list-items', {token: user.token})
        .then(data => data.listItems)
    }
  )

  return listItems
}

function useUpdateListItem(user) {
  const queryClient = useQueryClient()
  const {mutate} = useMutation(
    data => client(`list-items/${data.id}`, {method: 'PUT', token: user.token, data}),
    { onSettled: () => queryClient.invalidateQueries('list-items') }
  )

  return mutate
}

function useRemoveListItem(user) {
  const queryClient = useQueryClient()
  const {mutate} = useMutation(
    ({id}) => client(`list-items/${id}`, {method: 'DELETE', token: user.token}),
    { onSettled: () => queryClient.invalidateQueries('list-items') }
  )

  return mutate
}

function useCreateListItem(user) {
  const queryClient = useQueryClient()
  const {mutate} = useMutation(
    ({bookId}) => client('list-items', {token: user.token, data: {bookId}}),
    { onSettled: () => queryClient.invalidateQueries('list-items') }
  )

  return mutate
}

export {useCreateListItem, useListItem, useListItems, useRemoveListItem, useUpdateListItem}
