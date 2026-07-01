const dateFormatter = new Intl.DateTimeFormat('de-CH', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('de-CH', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value))
}