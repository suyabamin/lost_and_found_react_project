import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const trackingService = {
  updateLocation: async (lat, lng) => {
    return axios.post(`${API_URL}/tracking/update-location`, { latitude: lat, longitude: lng }, { withCredentials: true })
  },

  getSession: async (sessionId) => {
    return axios.get(`${API_URL}/tracking/${sessionId}`, { withCredentials: true })
  },

  completeSession: async (sessionId) => {
    return axios.post(`${API_URL}/tracking/${sessionId}/complete`, {}, { withCredentials: true })
  }
}

export default trackingService
