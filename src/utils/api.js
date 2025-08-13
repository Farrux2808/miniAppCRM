const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`
  
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

  console.log('API Call:', url, mergedOptions)
  
  try {
    const response = await fetch(url, mergedOptions)
    console.log('API Response:', response.status, response.statusText)
    return response
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}