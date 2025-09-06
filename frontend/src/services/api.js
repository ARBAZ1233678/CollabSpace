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

  async loginWithToken(token) {
    const response = await api.post('/auth/token-login', { token })

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

  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data
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
    try {
      const response = await api.get('/teams')
      return response.data
    } catch (error) {
      // Return mock data for development
      return [
        {
          id: 1,
          name: 'Development Team',
          membersCount: 5,
          description: 'Software development team'
        },
        {
          id: 2,
          name: 'Design Team',
          membersCount: 3,
          description: 'UI/UX design team'
        }
      ]
    }
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

    try {
      const response = await api.get(`/documents/team/${teamId}`, { params })
      return response.data
    } catch (error) {
      // Return mock data for development
      return [
        {
          id: 1,
          title: 'Project Requirements Document',
          updatedAt: new Date().toISOString(),
          lastModifiedByName: 'John Doe',
          type: 'DOCUMENT'
        },
        {
          id: 2,
          title: 'API Documentation',
          updatedAt: new Date(Date.now() - 24*60*60*1000).toISOString(),
          lastModifiedByName: 'Jane Smith',
          type: 'MARKDOWN'
        },
        {
          id: 3,
          title: 'Design System Guide',
          updatedAt: new Date(Date.now() - 48*60*60*1000).toISOString(),
          lastModifiedByName: 'Alice Johnson',
          type: 'DOCUMENT'
        }
      ]
    }
  },

  async getDocument(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}`)
      return response.data
    } catch (error) {
      // Return mock data for development
      return {
        id: documentId,
        title: 'Sample Document',
        content: 'This is a sample document for development purposes.',
        type: 'DOCUMENT',
        teamId: 1,
        createdBy: 1,
        updatedAt: new Date().toISOString()
      }
    }
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
    try {
      const response = await api.get(`/meetings/team/${teamId}`, {
        params: { page, size }
      })
      return response.data
    } catch (error) {
      // Return mock data for development
      return [
        {
          id: 1,
          title: 'Weekly Standup',
          startTime: new Date(Date.now() + 24*60*60*1000).toISOString(),
          participantsCount: 5,
          status: 'SCHEDULED'
        },
        {
          id: 2,
          title: 'Sprint Planning',
          startTime: new Date(Date.now() + 2*24*60*60*1000).toISOString(),
          participantsCount: 8,
          status: 'SCHEDULED'
        }
      ]
    }
  },

  async getMeeting(meetingId) {
    try {
      const response = await api.get(`/meetings/${meetingId}`)
      return response.data
    } catch (error) {
      // Return mock data for development
      return {
        id: meetingId,
        title: 'Sample Meeting',
        startTime: new Date().toISOString(),
        teamId: 1,
        status: 'IN_PROGRESS',
        meetingUrl: `https://meet.example.com/room/${meetingId}`
      }
    }
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

  // Permissions
  async get(endpoint) {
    const response = await api.get(endpoint)
    return response.data
  },

  async post(endpoint, data) {
    const response = await api.post(endpoint, data)
    return response.data
  },

  async put(endpoint, data) {
    const response = await api.put(endpoint, data)
    return response.data
  },

  async delete(endpoint) {
    const response = await api.delete(endpoint)
    return response.data
  },

  // Health check
  async healthCheck() {
    const response = await api.get('/health')
    return response.data
  }
}

export default apiService
