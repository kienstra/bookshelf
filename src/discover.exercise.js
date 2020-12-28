/** @jsx jsx */
import {jsx} from '@emotion/core'
import * as React from 'react'

import './bootstrap'
import Tooltip from '@reach/tooltip'
import {FaSearch} from 'react-icons/fa'
import {Input, BookListUL, Spinner} from './components/lib'
import {BookRow} from './components/book-row'
import {client} from './utils/api-client'

function DiscoverBooksScreen() {
  const stati = {
    idle: 'idle',
    loading: 'loading',
    rejected: 'rejected',
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
      case 'rejected':
        return {
          ...state,
          status: stati.rejected,
          data: action.data,
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
  })

  const queried = state.query != null
  const isLoading = stati.loading === state.status
  const isSuccess = stati.success === state.status

  React.useEffect(() => {
    if (!queried) {
      return
    }

    const controller = new AbortController()
    dispatch({type: 'loading', status: stati.loading})

    client(
      `books?query=${encodeURIComponent(state.query)}`,
      {
        referrerPolicy: 'origin-when-cross-origin',
        signal: controller.signal,
        headers: {'Accept': 'application/json'},
      }
    ).then(
      data => dispatch({type: 'success', data}),
      error => dispatch({type: 'rejected', data: error})
    )

    return () => {
      controller.abort()
    }

  },[queried, state.query, stati.loading])

  function handleSearchSubmit(event) {
    event.preventDefault()
    dispatch({
      type: 'queried',
      query: event.target.elements.search.value,
    })
  }

  return (
    <div
      css={{maxWidth: 800, margin: 'auto', width: '90vw', padding: '40px 0'}}
    >
      <form onSubmit={handleSearchSubmit}>
        <Input
          placeholder="Search books..."
          id="search"
          css={{width: '100%'}}
        />
        <Tooltip label="Search Books">
          <label htmlFor="search">
            <button
              type="submit"
              css={{
                border: '0',
                position: 'relative',
                marginLeft: '-35px',
                background: 'transparent',
              }}
            >
              {isLoading ? <Spinner /> : <FaSearch aria-label="search" />}
            </button>
          </label>
        </Tooltip>
      </form>

      {isSuccess ? (
        state.data?.books?.length ? (
          <BookListUL css={{marginTop: 20}}>
            {state.data.books.map(book => (
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
