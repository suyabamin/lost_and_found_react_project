import apiClient from './api'

const claimsService = {
  getMyClaims: () => apiClient.get('/claims/my'),
  submitClaim: (data) => apiClient.post('/claims', data),
  getClaimById: (id) => apiClient.get(`/claims/${id}`),
  founderRespond: (id, status) => apiClient.patch(`/claims/${id}/respond`, { status }),
}

export default claimsService
