import * as React from 'react'
import {useQuery, useMutation, useQueryClient} from 'react-query'
import {useAuth} from 'context/auth-context'
import {setQueryDataForBook} from './books'
import {client} from './api-client'

function useListItems() {
  const {user} = useAuth()
  const queryClient = useQueryClient()

  const {data} = useQuery(
    'list-items',
    () => client(`list-items`, {token: user.token}).then(data => data.listItems),
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
  const {user} = useAuth()
  const queryClient = useQueryClient()

  return useMutation(
    updates =>
      client(`list-items/${updates.id}`, {
        method: 'PUT',
        data: updates,
        token: user.token,
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
  const {user} = useAuth()
  const queryClient = useQueryClient()

  return useMutation(
    ({id}) => client(`list-items/${id}`, {method: 'DELETE', token: user.token}),
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
  const {user} = useAuth()
  const queryClient = useQueryClient()

  return useMutation(
    ({bookId}) => client(`list-items`, {data: {bookId}, token: user.token}),
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
