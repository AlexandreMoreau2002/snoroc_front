export const extractYoutubeId = (url) => {
  if (!url || typeof url !== 'string') return ''

  const shortMatch = url.match(/youtu\.be\/([\w-]{11})/)
  if (shortMatch?.[1]) return shortMatch[1]

  const longMatch = url.match(/[?&]v=([\w-]{11})/)
  if (longMatch?.[1]) return longMatch[1]

  const embedMatch = url.match(/embed\/([\w-]{11})/)
  if (embedMatch?.[1]) return embedMatch[1]

  return ''
}
