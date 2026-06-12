import apiClient from './api'

const messagingService = {
  getConversations: () => apiClient.get('/conversations'),
  createConversation: (itemId, data = {}) => {
    // Standardize to item_id for the backend
    const payload = data instanceof FormData ? data : { item_id: itemId, ...data };
    return apiClient.post(`/items/${itemId}/conversations`, payload);
  },
  startConversation: (data) => apiClient.post('/conversations/start', data),
  getConversationMessages: (conversationId) => apiClient.get(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, data) => {
    // Backend expects 'body' field. Handle both JSON and FormData.
    let payload = data;
    if (data && !(data instanceof FormData)) {
      // If we have 'message' or 'text', convert to 'body'
      const bodyText = data.body || data.message || data.text || '';
      payload = { ...data, body: bodyText };
    }
    return apiClient.post(`/conversations/${conversationId}/messages`, payload)
  },
  getUnreadCount: () => apiClient.get('/messages/unread-count')
}

export default messagingService
