import apiClient from './api'

const notificationsService = {
  getNotifications: () => apiClient.get('/notifications'),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  markAsRead: (id) => apiClient.post(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.post('/notifications/read-all'),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`)
}

export default notificationsService
