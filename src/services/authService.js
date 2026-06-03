import apiClient from './api'

// Mock database of users (for demo without backend)
const mockUsers = [
  {
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password', // In real app, this would be hashed
    phone: '+880123456789',
    role: 'user',
    avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=00cfe8&color=fff'
  },
  {
    id: 2,
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password',
    phone: '+880987654321',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=ff6b6b&color=fff'
  }
]

// Get all registered users from localStorage
const getStoredUsers = () => {
  const stored = localStorage.getItem('lf_users')
  return stored ? JSON.parse(stored) : mockUsers
}

// Save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem('lf_users', JSON.stringify(users))
}

const authService = {
  register: async (data) => {
    console.log('[AUTH] Register request started for:', data.email)
    try {
      const response = await apiClient.post('/auth/register', data)
      console.log('[AUTH] Register success:', response.data)
      return response
    } catch (error) {
      console.error('[AUTH] Register API failed:', error.response?.data || error.message)
      throw error
    }
  },

  login: async (email, password) => {
    console.log('[AUTH] Login request started for:', email)
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      console.log('[AUTH] Login success:', response.data)
      return response
    } catch (error) {
      console.error('[AUTH] Login API failed:', error.response?.data || error.message)
      throw error
    }
  },

  logout: async () => {
    console.log('[AUTH] Logout request started')
    try {
      return await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('[AUTH] Logout failed:', error.message)
      return { data: { success: true } }
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me')
      return response
    } catch (error) {
      return { data: null }
    }
  },
  
  updateProfile: async (data) => {
    console.log('[AUTH] Update profile started')
    try {
      const response = await apiClient.post('/profile', data)
      console.log('[AUTH] Update success')
      return response
    } catch (error) {
      console.error('[AUTH] Update failed')
      throw error
    }
  },
  
  changePassword: async (data) => {
    console.log('[AUTH] Change password started')
    try {
      const response = await apiClient.post('/profile/password', data)
      console.log('[AUTH] Password change success')
      return response
    } catch (error) {
      console.error('[AUTH] Password change failed')
      throw error
    }
  },
  
  getProfilePosts: () => apiClient.get('/profile/posts'),
  getProfileFavorites: () => apiClient.get('/profile/favorites'),
  getProfileClaims: () => apiClient.get('/profile/claims'),
  getProfileStats: () => apiClient.get('/profile/stats')
}

export default authService
