/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
import {
  FaCheckCircle,
  FaPlusCircle,
  FaMinusCircle,
  FaBook,
  FaTimesCircle,
} from 'react-icons/fa'
import Tooltip from '@reach/tooltip'
import {useQuery, useQueryClient, useMutation} from 'react-query'
import {client} from 'utils/api-client'
import {useAsync} from 'utils/hooks'
import * as colors from 'styles/colors'
import {CircleButton, Spinner} from './lib'

function TooltipButton({label, highlight, onClick, icon, ...rest}) {
  const {isLoading, isError, error, run} = useAsync()

  function handleClick() {
    run(Promise.resolve(onClick()))
  }

  return (
    <Tooltip label={isError ? error.message : label}>
      <CircleButton
        css={{
          backgroundColor: 'white',
          ':hover,:focus': {
            color: isLoading
              ? colors.gray80
              : isError
              ? colors.danger
              : highlight,
          },
        }}
        disabled={isLoading}
        onClick={handleClick}
        aria-label={isError ? error.message : label}
        {...rest}
      >
        {isLoading ? <Spinner /> : isError ? <FaTimesCircle /> : icon}
      </CircleButton>
    </Tooltip>
  )
}

function StatusButtons({user, book}) {
  const queryClient = useQueryClient()
  const {data: listItems} = useQuery(
    'list-items',
    () => {
      return client('list-items', {token: user.token})
        .then(data => data.listItems)
    }
  )

  const listItem = Array.isArray( listItems )
    ? listItems.find(item => item.bookId === book.id)
    : null

  const invalidate = () => queryClient.invalidateQueries('list-items')

  const mutationConfig = {onSettled: invalidate}
  const {mutate: update} = useMutation(
    data => {
      invalidate()
      return client(`list-items/${data.id}`, {method: 'PUT', token: user.token, data})
    },
    mutationConfig
  )

  // 🐨 call useMutation here and assign the mutate function to "remove"
  // the mutate function should call the list-items/:listItemId endpoint with a DELETE
  const {mutate: remove} = useMutation(
    data => client(`list-items/${data.id}`, {method: 'DELETE', token: user.token}),
    mutationConfig
  )

  // 🐨 call useMutation here and assign the mutate function to "create"
  // the mutate function should call the list-items endpoint with a POST
  // and the bookId the listItem is being created for.
  const {mutate: create} = useMutation(
    () => client('list-items', {token: user.token, data: {bookId: book.id}}),
    mutationConfig
  )

  return (
    <React.Fragment>
      {listItem ? (
        Boolean(listItem.finishDate) ? (
          <TooltipButton
            label="Unmark as read"
            highlight={colors.yellow}
            onClick={() => update({id: listItem.id, finishDate: null})}
            icon={<FaBook />}
          />
        ) : (
          <TooltipButton
            label="Mark as read"
            highlight={colors.green}
            onClick={() => update({id: listItem.id, finishDate: Date.now()})}
            icon={<FaCheckCircle />}
          />
        )
      ) : null}
      {listItem ? (
        <TooltipButton
          label="Remove from list"
          highlight={colors.danger}
          onClick={() => remove({id: listItem.id})}
          icon={<FaMinusCircle />}
        />
      ) : (
        <TooltipButton
          label="Add to list"
          highlight={colors.indigo}
          onClick={() => create()}
          icon={<FaPlusCircle />}
        />
      )}
    </React.Fragment>
  )
}

export {StatusButtons}
