export function money(value) {
  const n = Number(value || 0)
  return `¥${n.toFixed(2)}`
}

export function normalizeList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.records)) return data.records
  if (Array.isArray(data?.list)) return data.list
  return []
}
