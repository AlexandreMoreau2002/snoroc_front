import { extractYoutubeId } from '../youtube'

describe('extractYoutubeId', () => {
  it('returns the id from a youtu.be short url', () => {
    expect(extractYoutubeId('https://youtu.be/abcdefghijk')).toBe('abcdefghijk')
  })

  it('returns the id from a standard youtube watch url', () => {
    expect(extractYoutubeId('https://www.youtube.com/watch?v=lmnopqrstuv&feature=youtu.be')).toBe(
      'lmnopqrstuv'
    )
  })

  it('returns the id from an embed url', () => {
    expect(extractYoutubeId('https://www.youtube.com/embed/12345678901')).toBe('12345678901')
  })

  it('returns empty string for invalid inputs', () => {
    expect(extractYoutubeId('https://example.com/video')).toBe('')
    expect(extractYoutubeId('')).toBe('')
    expect(extractYoutubeId(null)).toBe('')
    expect(extractYoutubeId(undefined)).toBe('')
  })
})
