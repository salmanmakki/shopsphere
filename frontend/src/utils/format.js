export const LOW_STOCK_THRESHOLD = 5

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

export const formatCurrency = (value) => {
  const amount = Number(value)
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0)
}

export const formatDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))

export const getStockStatus = (stock, threshold = LOW_STOCK_THRESHOLD) => {
  const quantity = Number(stock) || 0
  if (quantity <= 0) return 'out'
  if (quantity <= threshold) return 'low'
  return 'in'
}

export const getStockLabel = (stock, threshold = LOW_STOCK_THRESHOLD) => {
  const quantity = Number(stock) || 0
  const status = getStockStatus(quantity, threshold)
  if (status === 'out') return 'Out of stock'
  if (status === 'low') return `Low stock · ${quantity} left`
  return 'In stock'
}

export const getDiscountPercent = (price, originalPrice) => {
  const current = Number(price)
  const original = Number(originalPrice)
  if (!Number.isFinite(original) || original <= current) return null
  return Math.round(((original - current) / original) * 100)
}
