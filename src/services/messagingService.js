import apiClient from './api'

const messagingService = {
  getConversations: () => apiClient.get('/conversations'),
  createConversation: (itemId, data) => apiClient.post(`/items/${itemId}/conversations`, data),
  startConversation: (data) => apiClient.post('/conversations/start', data),
  getConversationMessages: (conversationId) => apiClient.get(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, data) => {
    // Backend expects 'body' field. Handle both JSON and FormData.
    let payload = data;
    if (!(data instanceof FormData)) {
      payload = data.message ? { body: data.message, ...data } : data;
    }
    return apiClient.post(`/conversations/${conversationId}/messages`, payload)
  },
  getUnreadCount: () => apiClient.get('/messages/unread-count')
}

export default messagingService
