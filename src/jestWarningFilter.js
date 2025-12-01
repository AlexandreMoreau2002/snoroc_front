/*
 * Apply warning filtering before the Jest environment initializes so that
 * Node's built-in deprecation logs (notably the punycode warning) do not
 * pollute the test output. This runs earlier than setupTests.js because it
 * is registered via Jest's setupFiles hook.
 */
const originalEmitWarning = process.emitWarning

process.emitWarning = (warning, ...args) => {
  const code =
    (warning && warning.code) || (typeof args[1] === 'string' ? args[1] : undefined)

  if (code === 'DEP0040' || /punycode/i.test(String(warning))) {
    return
  }

  return originalEmitWarning.call(process, warning, ...args)
}

jest.mock('punycode', () => ({}), { virtual: true })
