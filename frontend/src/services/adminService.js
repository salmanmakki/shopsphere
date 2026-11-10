import api from './api'

export const getDashboard = () => api.get('/admin/dashboard')

export const getAdminProducts = (params = {}, config = {}) =>
  api.get('/admin/products', { params, ...config })

export const createProduct = (payload) =>
  api.post('/admin/products', payload)

export const updateProduct = (id, payload) =>
  api.put(`/admin/products/${id}`, payload)

export const deleteProduct = (id) => api.delete(`/admin/products/${id}`)

export const uploadImage = (file, onUploadProgress) => {
  const formData = new FormData()
  formData.append('image', file)

  return api.post('/admin/upload', formData, { onUploadProgress })
}
