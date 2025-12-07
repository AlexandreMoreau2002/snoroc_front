import * as exported from '../export'

it('exports core components', () => {
  expect(exported.Button).toBeDefined()
  expect(exported.Loader).toBeDefined()
})
