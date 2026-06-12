import apiClient from './api'

const adminService = {
  getStats: () => apiClient.get('/admin/stats'),
  getDashboardStats: () => apiClient.get('/admin/dashboard'),
  getUsers: (params = {}) => apiClient.get('/admin/users', { params }),
  getPosts: (params = {}) => apiClient.get('/admin/posts', { params }),
  getReports: (params = {}) => apiClient.get('/admin/reports', { params }),
  getClaims: () => apiClient.get('/admin/claims'),
  
  // User Actions
  banUser: (userId) => apiClient.post('/admin/ban-user', { userId }),
  unbanUser: (userId) => apiClient.post('/admin/unban-user', { userId }),
  promoteUser: (userId) => apiClient.post('/admin/promote-user', { userId }),
  demoteUser: (userId) => apiClient.post('/admin/demote-user', { userId }),
  
  // Post Actions
  postAction: (postId, action) => apiClient.post(`/admin/posts/${postId}/action`, { action }),
  
  // Resolution Actions
  resolveClaim: (id, data) => apiClient.patch(`/admin/claims/${id}`, data),
  resolveReport: (id, data) => apiClient.post(`/admin/reports/${id}`, data)
}

export default adminService
