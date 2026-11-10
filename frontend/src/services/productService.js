import api from './api'

export const getProducts = (params = {}, config = {}) =>
  api.get('/products', { params, ...config })

export const getProduct = (id, config = {}) =>
  api.get(`/products/${id}`, config)

export const getCategories = (config = {}) =>
  api.get('/products/categories', config)
