export const formatDate = (dateValue) => {
  if (!dateValue) return ''
  const parsedDate = new Date(dateValue)
  if (Number.isNaN(parsedDate.getTime())) return ''
  return parsedDate.toLocaleDateString('fr-FR')
}

export const splitContentToParagraphs = (content) => {
  if (!content) return []

  const paragraphs = content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) {
    return [content]
  }

  return paragraphs
}
