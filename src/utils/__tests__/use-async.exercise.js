import {renderHook, act} from '@testing-library/react-hooks'
import {useAsync} from '../hooks'

beforeEach(() => {
  jest.spyOn(console, 'error')
})

afterEach(() => {
  console.error.mockRestore()
})

function getAsyncState(overrides = {}) {
  return {
    isIdle: true,
    isLoading: false,
    isError: false,
    isSuccess: false,
    setData: expect.any(Function),
    setError: expect.any(Function),
    error: null,
    status: 'idle',
    data: null,
    run: expect.any(Function),
    reset: expect.any(Function),
    ...overrides
  }
}

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

  expect(result.current).toEqual(getAsyncState())

  let p
  act(() => {
    p = result.current.run(promise)
  })

  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isLoading: true,
      status: 'pending',
    })
  )

  const resolvedValue = Symbol('resolved value')
  await act(async () => {
    resolve(resolvedValue)
    await p
  })

  expect(result.current).toEqual(
    getAsyncState({
      data: resolvedValue,
      isIdle:false,
      isSuccess: true,
      status: 'resolved',
    })
  )

  act(() => {
    result.current.reset()
  })

  expect(result.current).toEqual(getAsyncState())
})

test('calling run with a promise which rejects', async () => {
  const {promise, reject} = deferred()
  const {result} = renderHook(() => useAsync())

  const rejectedValue = Symbol('rejected value')
  await act(async () => {
    result.current.run(promise).catch(() => {
      // ignore error
    })
    reject(rejectedValue)
  })

  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isError: true,
      isSuccess: false,
      error: rejectedValue,
      status: 'rejected',
      data: null,
    })
  )
})

test('can specify an initial state', () => {
  const mockData = {fruit: 'apple'}
  const initialState = {
    status: 'resolved',
    data: mockData,
  }
  const {result} = renderHook(() => useAsync(initialState))

  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isSuccess: true,
      ...initialState
    })
  )
})

test('can set the data', async () => {
  const resolvedValue = Symbol('resolved value')
  const {result} = renderHook(() => useAsync())

  await act(async () => {
    result.current.setData(resolvedValue)
  })

  expect(result.current).toEqual(
    getAsyncState({
      isIdle: false,
      isSuccess: true,
      data: resolvedValue,
      status: 'resolved',
    })
  )
})

test('can set the error', async () => {
  const rejectedValue = Symbol('rejected value')
  const {result} = renderHook(() => useAsync())

  await act(async () => {
    result.current.setError(rejectedValue)
  })

  expect(result.current).toEqual(
    getAsyncState({
      isError: true,
      isIdle: false,
      status: 'rejected',
      error: rejectedValue,
    })
  )
})

test('No state updates happen if the component is unmounted while pending', async () => {
  const {promise, resolve} = deferred()
  const {result, unmount} = renderHook(() => useAsync())
  let p

  act(() => {
    p = result.current.run(promise)
  })
  unmount()

  await act(async () => {
    resolve({foo: 'foo'})
    await p
  })

  expect(console.error).not.toHaveBeenCalled()
})

test('calling "run" without a promise results in an early error', async () => {
  const {result} = renderHook(() => useAsync())

  expect(() => result.current.run(() => {})).toThrowErrorMatchingInlineSnapshot(
    `"The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?"`,
  )
})
