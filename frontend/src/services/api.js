import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 20000,
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const response = error.response
    const message =
      response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'The request took too long. Please try again.'
        : 'Unable to reach the server. Check your connection and try again.')

    const normalizedError = new Error(message)
    normalizedError.status = response?.status
    normalizedError.errors = response?.data?.errors || []
    normalizedError.code = error.code
    normalizedError.isCancel = error.code === 'ERR_CANCELED'

    return Promise.reject(normalizedError)
  },
)

export default api
