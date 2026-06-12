import apiClient from './api'

const itemsService = {
  getItems: (filters = {}) => apiClient.get('/items', { params: filters }),
  getItemById: (id) => apiClient.get(`/items/${id}`),
  createItem: (data) => apiClient.post('/items', data),
  updateItem: (id, data) => apiClient.post(`/items/${id}`, data),
  deleteItem: (id) => apiClient.delete(`/items/${id}`),
  getMatches: (id) => apiClient.get(`/items/${id}/matches`),
  toggleFavorite: (data) => apiClient.post('/favorites/toggle', data),
  getFavorites: () => apiClient.get('/favorites'),
  submitClaim: (data) => apiClient.post('/claims', data),
  identifyOwnership: (data) => apiClient.post('/claims', data),
  submitReport: (id, data) => apiClient.post(`/items/${id}/reports`, data),
  
  // Admin methods
  getPendingClaims: () => apiClient.get('/admin/claims'),
  updateClaimStatus: (id, data) => apiClient.patch(`/admin/claims/${id}`, data)
}

export default itemsService
