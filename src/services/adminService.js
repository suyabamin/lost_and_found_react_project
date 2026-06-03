import apiClient from './api'

const adminService = {
  getStats: () => apiClient.get('/admin/stats'),
  getUsers: (params = {}) => apiClient.get('/admin/users', { params }),
  getPosts: (params = {}) => apiClient.get('/admin/posts', { params }),
  getReports: (params = {}) => apiClient.get('/admin/reports', { params }),
  resolveClaim: (id, data) => apiClient.post(`/admin/claims/${id}`, data),
  resolveReport: (id, data) => apiClient.post(`/admin/reports/${id}`, data)
}

export default adminService
