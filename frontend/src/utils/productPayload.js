export const toProductPayload = (form) => ({
  name: form.name.trim(),
  description: form.description.trim(),
  category: form.category.trim(),
  price: Number(form.price),
  originalPrice:
    form.originalPrice === '' || form.originalPrice === null
      ? null
      : Number(form.originalPrice),
  stock: Number(form.stock),
  image: form.image.trim(),
  isFeatured: Boolean(form.isFeatured),
  isBestSeller: Boolean(form.isBestSeller),
})

export const applyServerFieldErrors = (errors, setter) => {
  if (!Array.isArray(errors) || errors.length === 0) return

  const next = {}
  errors.forEach((error) => {
    if (error.field) next[error.field] = error.message
  })

  if (Object.keys(next).length > 0) {
    setter((current) => ({ ...current, ...next }))
  }
}
