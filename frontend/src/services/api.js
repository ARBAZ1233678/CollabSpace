import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error

    if (response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (response?.status >= 400) {
      const message = response.data?.message || response.data?.error || 'Request failed'
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

// API service methods
export const apiService = {
  // Authentication
  async login(googleToken) {
    const response = await api.post('/auth/google-login', { token: googleToken })

    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
    }

    return response.data
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  },

  async getCurrentUser() {
    const response = await api.get('/auth/profile')
    return response.data
  },

  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData)
    return response.data
  },

  // Teams
  async getTeams() {
    const response = await api.get('/teams')
    return response.data
  },

  async createTeam(teamData) {
    const response = await api.post('/teams', teamData)
    return response.data
  },

  async getTeamMembers(teamId) {
    const response = await api.get(`/teams/${teamId}/members`)
    return response.data
  },

  // Documents
  async getTeamDocuments(teamId, page = 0, size = 20, search = '') {
    const params = { page, size }
    if (search) params.search = search

    const response = await api.get(`/documents/team/${teamId}`, { params })
    return response.data
  },

  async getDocument(documentId) {
    const response = await api.get(`/documents/${documentId}`)
    return response.data
  },

  async createDocument(documentData) {
    const response = await api.post('/documents', documentData)
    return response.data
  },

  async updateDocument(documentId, documentData) {
    const response = await api.put(`/documents/${documentId}`, documentData)
    return response.data
  },

  async deleteDocument(documentId) {
    await api.delete(`/documents/${documentId}`)
  },

  async lockDocument(documentId) {
    await api.post(`/documents/${documentId}/lock`)
  },

  async unlockDocument(documentId) {
    await api.post(`/documents/${documentId}/unlock`)
  },

  async exportToGoogleDocs(documentId) {
    const response = await api.post(`/documents/${documentId}/export-google-docs`)
    return response.data.googleDocsUrl
  },

  // Meetings
  async getTeamMeetings(teamId, page = 0, size = 20) {
    const response = await api.get(`/meetings/team/${teamId}`, {
      params: { page, size }
    })
    return response.data
  },

  async getMeeting(meetingId) {
    const response = await api.get(`/meetings/${meetingId}`)
    return response.data
  },

  async createMeeting(meetingData) {
    const response = await api.post('/meetings', meetingData)
    return response.data
  },

  async updateMeeting(meetingId, meetingData) {
    const response = await api.put(`/meetings/${meetingId}`, meetingData)
    return response.data
  },

  async startMeeting(meetingId) {
    const response = await api.post(`/meetings/${meetingId}/start`)
    return response.data
  },

  async endMeeting(meetingId) {
    const response = await api.post(`/meetings/${meetingId}/end`)
    return response.data
  },

  async getMeetingSummary(meetingId) {
    const response = await api.get(`/meetings/${meetingId}/summary`)
    return response.data
  },

  // AI Features
  async generateMeetingSummary(meetingId, transcript) {
    const response = await api.post(`/meetings/${meetingId}/generate-summary`, {
      transcript
    })
    return response.data
  },

  // Analytics
  async getTeamAnalytics(teamId, dateRange = '7d') {
    const response = await api.get(`/analytics/team/${teamId}`, {
      params: { range: dateRange }
    })
    return response.data
  },

  // Health check
  async healthCheck() {
    const response = await api.get('/auth/health')
    return response.data
  }
}

export default apiService
