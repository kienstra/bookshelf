import {server, rest} from 'test/server'
import {client} from '../api-client'

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
    }
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
  let request

  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json('bax'))
    }),
  )

  await client(endpoint, {data})
  expect(request.body).toStrictEqual(data)
})
