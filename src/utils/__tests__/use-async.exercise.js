import {renderHook, act} from '@testing-library/react-hooks'
import {useAsync} from '../hooks'

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

test('calling run with a promise which resolves', async () => {
  const {promise, resolve} = deferred()
  const {result} = renderHook(() => useAsync())

  expect(result.current.isIdle).toEqual(true)
  expect(result.current.isLoading).toEqual(false)
  expect(result.current.isError).toEqual(false)
  expect(result.current.isSuccess).toEqual(false)
  expect(result.current.setData).toEqual(expect.any(Function))
  expect(result.current.setError).toEqual(expect.any(Function))
  expect(result.current.error).toEqual(null)
  expect(result.current.status).toEqual('idle')
  expect(result.current.data).toEqual(null)
  expect(result.current.run).toEqual(expect.any(Function))
  expect(result.current.reset).toEqual(expect.any(Function))

  act(() => {
    result.current.run(promise)
  })

  expect(result.current.status).toEqual('pending')
  expect(result.current.isLoading).toEqual(true)

  const data = {fruit: 'banana'}
  await act(async () => {
    resolve(data)
  })

  expect(result.current.isSuccess).toEqual(true)
  expect(result.current.error).toEqual(null)
  expect(result.current.status).toEqual('resolved')
  expect(result.current.data).toEqual(data)

  act(() => {
    result.current.reset()
  })

  expect(result.current.isIdle).toEqual(true)
  expect(result.current.error).toEqual(null)
  expect(result.current.status).toEqual('idle')
  expect(result.current.data).toEqual(null)
})
// 🐨 get a promise and resolve function from the deferred utility
// 🐨 use renderHook with useAsync to get the result
// 🐨 assert the result.current is the correct default state

// 🐨 call `run`, passing the promise
//    (💰 this updates state so it needs to be done in an `act` callback)
// 🐨 assert that result.current is the correct pending state

// 🐨 call resolve and wait for the promise to be resolved
//    (💰 this updates state too and you'll need it to be an async `act` call so you can await the promise)
// 🐨 assert the resolved state

// 🐨 call `reset` (💰 this will update state, so...)
// 🐨 assert the result.current has actually been reset

test('calling run with a promise which rejects', async () => {
  const {promise, reject} = deferred()
  const {result} = renderHook(() => useAsync())

  const error = {message: 'There was a problem'}
  await act(async () => {
    result.current.run(promise).catch(() => {})
    reject(error)
  })

  expect(result.current.isError).toEqual(true)
  expect(result.current.error).toEqual(error)
  expect(result.current.status).toEqual('rejected')
  expect(result.current.data).toEqual(null)
})
// 🐨 this will be very similar to the previous test, except you'll reject the
// promise instead and assert on the error state.
// 💰 to avoid the promise actually failing your test, you can catch
//    the promise returned from `run` with `.catch(() => {})`

test('can specify an initial state', () => {
  const initialState = {
    status: 'pending',
    data: {fruit: 'apple'},
    error: {message: 'There was an error'},
  }
  const {result} = renderHook(() => useAsync(initialState))

  expect(result.current.status).toEqual(initialState.status)
  expect(result.current.data).toEqual(initialState.data)
  expect(result.current.error).toEqual(initialState.error)
})

test('can set the data', async () => {
  const data = {vegetable: 'celery'}
  const {result} = renderHook(() => useAsync(data))

  await act(async () => {
    result.current.setData(data)
  })

  expect(result.current.data).toEqual(data)
})

test('can set the error', async () => {
  const error = {message: 'There was a terrible error'}
  const {result} = renderHook(() => useAsync())

  await act(async () => {
    result.current.setError(error)
  })
  expect(result.current.error).toEqual(error)
})

test('No state updates happen if the component is unmounted while pending', async () => {
  const {result, unmount} = renderHook(() => useAsync())
  await unmount()
  result.current.setData({foo: 'Foo'})
})

test('calling "run" without a promise results in an early error', async () => {
  const {result} = renderHook(() => useAsync())

  expect(() => result.current.run(() => {})).toThrowError()
})
