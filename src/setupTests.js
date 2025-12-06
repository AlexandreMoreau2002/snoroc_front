import './jestWarningFilter'
import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'util'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const originalEmitWarning = process.emitWarning
process.emitWarning = (warning, ...args) => {
  const code =
    (warning && warning.code) || (typeof args[1] === 'string' ? args[1] : undefined)

  if (code === 'DEP0040' || /punycode/i.test(String(warning))) {
    return
  }

  return originalEmitWarning.call(process, warning, ...args)
}

const consoleSpies = ['log', 'warn', 'error'].map((method) => {
  const original = console[method]
  const spy = jest.spyOn(console, method)
  spy.mockImplementation(() => {})
  spy.original = original
  return spy
})

afterAll(() => {
  consoleSpies.forEach((spy) => spy.mockRestore())
})

jest.mock(
  'react-icons/fi',
  () => ({
    FiSearch: () => null,
    FiEdit2: () => null,
    FiEye: () => null,
    FiTrash2: () => null,
    FiMapPin: () => null,
  }),
  { virtual: true }
)

const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    defaults: { headers: { common: {} } },
  })),
}

jest.mock('axios', () => mockAxios)

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder
}
