const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    }
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  }

  return fetch(url, mergedOptions)
}