import {queryCache} from 'react-query'
import * as auth from 'auth-provider'
import {server, rest} from 'test/server'
import {client} from '../api-client'

jest.mock('react-query')
jest.mock('auth-provider')

const apiURL = process.env.REACT_APP_API_URL

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

test('calls fetch at the endpoint with the arguments for GET requests', async () => {
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.json(mockResult))
    }),
  )

  expect(await client(endpoint)).toStrictEqual(mockResult)
})

test('adds auth token when a token is provided', async () => {
  const token = 292345234
  const endpoint = 'baz'
  let request
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json('bax'))
    }),
  )

  await client(endpoint, {token})
  expect(request.headers.get('Authorization')).toStrictEqual(`Bearer ${token}`)
})

test('allows for config overrides', async () => {
  const endpoint = 'example'
  const mode = 'cors'
  const acceptEncoding = 'gzip, deflate, br'
  const config = {
    mode,
    headers: {
      'Accept-Encoding': acceptEncoding,
    },
  }
  let request

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json('bax'))
    }),
  )

  await client(endpoint, config)
  expect(request.headers.get('Accept-Encoding')).toStrictEqual(acceptEncoding)
  expect(request.mode).toStrictEqual(mode)
})

test('when data is provided, it is stringified and the method defaults to POST', async () => {
  const endpoint = 'another'
  const data = {fruit: 'apple'}

  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.json(req.body))
    }),
  )

  const result = await client(endpoint, {data})
  expect(result).toStrictEqual(data)
})

test('when the response is not ok, the promise is rejected with data', async () => {
  const endpoint = 'baz'
  const data = {message: 'There was an error'}

  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(500), ctx.json(data))
    }),
  )

  const result = await client(endpoint, {data}).catch(e => e)
  expect(result).toMatchInlineSnapshot(`
    Object {
      "message": "There was an error",
    }
  `)
})

test('when the response is 401, the user is logged out and the query cache is cleared', async () => {
  queryCache.clear = jest.fn()

  const endpoint = 'foo'
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(401), ctx.json({message: 'Unauthorized'}))
    }),
  )

  let error
  try {
    await client(endpoint)
  } catch (e) {
    error = e
  }

  expect(auth.logout).toHaveBeenCalled()
  expect(queryCache.clear).toHaveBeenCalled()
  expect(error).toStrictEqual({message: 'Please re-authenticate.'})
})
