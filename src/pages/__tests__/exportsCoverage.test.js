import * as componentExports from '../../components/export'
import * as pageExports from '../visitor/export'
import * as adminExports from '../admin/export'

describe('Export barrels', () => {
  it('exposes component exports', () => {
    expect(componentExports.Button).toBeDefined()
    expect(componentExports.Header).toBeDefined()
  })

  it('exposes visitor pages', () => {
    expect(pageExports.Home).toBeDefined()
    expect(pageExports.About).toBeDefined()
  })

  it('exposes admin pages', () => {
    expect(adminExports.CreateNews).toBeDefined()
    expect(adminExports.EditAbout).toBeDefined()
  })
})
