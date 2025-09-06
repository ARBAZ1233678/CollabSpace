import { apiService } from './api'
import { googleService } from './googleService'

class AuthService {
  constructor() {
    this.user = null
    this.isAuthenticated = false
    this.listeners = []
  }

  /**
   * Add auth state change listener
   */
  addAuthStateListener(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  /**
   * Notify all listeners of auth state change
   */
  notifyAuthStateChange() {
    this.listeners.forEach(listener => {
      listener({
        user: this.user,
        isAuthenticated: this.isAuthenticated
      })
    })
  }

  /**
   * Initialize authentication state
   */
  async initializeAuth() {
    try {
      const token = this.getStoredToken()
      if (token) {
        // Validate token and get user info
        const user = await apiService.getCurrentUser()
        this.setAuthState(user, true)
        return user
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      this.clearAuthState()
    }
    return null
  }

  /**
   * Login with Google OAuth
   */
  async loginWithGoogle() {
    try {
      // Get Google OAuth token
      const googleAuth = await googleService.signIn()

      // Send token to backend for validation and JWT creation
      const response = await apiService.login(googleAuth.idToken)

      // Store tokens
      this.storeTokens(response.accessToken, response.refreshToken)

      // Set auth state
      this.setAuthState(response.user, true)

      return response.user
    } catch (error) {
      console.error('Google login failed:', error)
      throw new Error('Failed to sign in with Google. Please try again.')
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Call backend logout endpoint
      await apiService.logout()
    } catch (error) {
      console.error('Backend logout failed:', error)
    }

    try {
      // Sign out from Google
      await googleService.signOut()
    } catch (error) {
      console.error('Google sign out failed:', error)
    }

    // Clear local auth state
    this.clearAuthState()
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await apiService.refreshToken(refreshToken)

      // Update stored tokens
      this.storeTokens(response.accessToken, response.refreshToken)

      return response.accessToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clearAuthState()
      throw error
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData) {
    try {
      const updatedUser = await apiService.updateProfile(userData)
      this.setAuthState(updatedUser, true)
      return updatedUser
    } catch (error) {
      console.error('Profile update failed:', error)
      throw error
    }
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated() {
    return this.isAuthenticated && !!this.user && !!this.getStoredToken()
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.user
  }

  /**
   * Get stored access token
   */
  getStoredToken() {
    return localStorage.getItem('accessToken')
  }

  /**
   * Get stored refresh token
   */
  getStoredRefreshToken() {
    return localStorage.getItem('refreshToken')
  }

  /**
   * Store authentication tokens
   */
  storeTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
  }

  /**
   * Set authentication state
   */
  setAuthState(user, isAuthenticated) {
    this.user = user
    this.isAuthenticated = isAuthenticated
    this.notifyAuthStateChange()
  }

  /**
   * Clear authentication state
   */
  clearAuthState() {
    this.user = null
    this.isAuthenticated = false

    // Clear stored tokens
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')

    // Clear any cached user data
    localStorage.removeItem('userData')

    this.notifyAuthStateChange()
  }

  /**
   * Check if token is expired (basic check)
   */
  isTokenExpired(token) {
    if (!token) return true

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      console.error('Failed to decode token:', error)
      return true
    }
  }

  /**
   * Auto-refresh token if needed
   */
  async ensureValidToken() {
    const token = this.getStoredToken()

    if (!token || this.isTokenExpired(token)) {
      try {
        await this.refreshToken()
        return this.getStoredToken()
      } catch (error) {
        console.error('Failed to refresh token:', error)
        this.clearAuthState()
        throw new Error('Authentication expired. Please sign in again.')
      }
    }

    return token
  }

  /**
   * Get user permissions for a resource
   */
  async getUserPermissions(resourceType, resourceId) {
    try {
      const response = await apiService.get(`/permissions/${resourceType}/${resourceId}`)
      return response.permissions || []
    } catch (error) {
      console.error('Failed to get user permissions:', error)
      return []
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(permission, resourceType, resourceId) {
    try {
      const permissions = await this.getUserPermissions(resourceType, resourceId)
      return permissions.includes(permission)
    } catch (error) {
      console.error('Failed to check permission:', error)
      return false
    }
  }

  /**
   * Password-less authentication for development
   */
  async mockLogin(email) {
    if (import.meta.env.NODE_ENV === 'development') {
      const mockUser = {
        id: Date.now(),
        email: email,
        name: email.split('@')[0],
        profilePicture: `https://i.pravatar.cc/150?u=${email}`,
        role: 'MEMBER'
      }

      // Mock JWT token
      const mockToken = btoa(JSON.stringify({
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      }))

      this.storeTokens(mockToken, 'mock-refresh-token')
      this.setAuthState(mockUser, true)

      return mockUser
    }

    throw new Error('Mock login only available in development mode')
  }
}

export const authService = new AuthService()
export default authService
