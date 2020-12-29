/** @jsx jsx */
import {jsx} from '@emotion/core'
import * as React from 'react'

import './bootstrap'
import Tooltip from '@reach/tooltip'
import {FaSearch, FaTimes} from 'react-icons/fa'
import {Input, BookListUL, Spinner} from './components/lib'
import {BookRow} from './components/book-row'
import {client} from './utils/api-client'
import * as colors from 'styles/colors'
import {useAsync} from 'utils/hooks'

function DiscoverBooksScreen() {
  const searchId = 'search'
  const stati = {
    error: 'error',
    idle: 'idle',
    loading: 'loading',
    success: 'succes',
  }

  function reducer(state, action) {
    switch (action.type) {
      case 'queried':
        return {
          ...state,
          query: action.query,
        }
      case 'loading':
        return {
          ...state,
          status: stati.loading,
        }
      case 'success':
        return {
          ...state,
          status: stati.success,
          data: action.data,
          query: null,
        }
      case 'error':
        return {
          ...state,
          status: stati.error,
          error: action.error,
          data: null,
          query: null,
        }
      default:
        throw new Error(`unsupported action.type passed to the reducer: ${action.type}`)
    }
  }

  const [state, dispatch] = React.useReducer(reducer, {
    status: stati.idle,
    data: null,
    query: null,
    error: null,
  })

  const {data, error, run, isLoading, isError, isSuccess} = useAsync({
    status: 'idle', data: null, error: null
  })
  const queried = state.query != null
  React.useEffect(() => {
    if (!queried) {
      return
    }

    const controller = new AbortController()
    dispatch({type: 'loading', status: stati.loading})

    run(
      client(
        `books?query=${encodeURIComponent(state.query)}`,
        {
          referrerPolicy: 'origin-when-cross-origin',
          signal: controller.signal,
          headers: {'Accept': 'application/json'},
        }
      )
    ).then(
      data => dispatch({type: 'success', data}),
      error => dispatch({type: 'error', error})
    )

    return () => {
      controller.abort()
    }
  },[queried, run, state.query, stati.loading])

  function handleSearchSubmit(event) {
    event.preventDefault()
    dispatch({
      type: 'queried',
      query: event.target.elements[searchId].value,
    })
  }

  return (
    <div
      css={{maxWidth: 800, margin: 'auto', width: '90vw', padding: '40px 0'}}
    >
      <form onSubmit={handleSearchSubmit}>
        <Input
          placeholder="Search books..."
          id={searchId}
          css={{width: '100%'}}
        />
        <Tooltip label="Search Books">
          <label htmlFor={searchId}>
            <button
              type="submit"
              css={{
                border: '0',
                position: 'relative',
                marginLeft: '-35px',
                background: 'transparent',
              }}
            >
              {isLoading ? <Spinner /> : isError ? <FaTimes aria-label="error" css={{color: colors.danger}}/> : <FaSearch aria-label="search" />}
            </button>
          </label>
        </Tooltip>
      </form>

      {isError ? (
        <div css={{color: colors.danger}
        }>
        <p>There was an error:</p>
        <pre>{error.message}</pre>
        </div>
      ) : null }

      {isSuccess ? (
        data?.books?.length ? (
          <BookListUL css={{marginTop: 20}}>
            {data.books.map(book => (
              <li key={book.id} aria-label={book.title}>
                <BookRow key={book.id} book={book} />
              </li>
            ))}
          </BookListUL>
        ) : (
          <p>No books found. Try another search.</p>
        )
      ) : null}
    </div>
  )
}

export {DiscoverBooksScreen}
