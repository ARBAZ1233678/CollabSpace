import React, { useState, useEffect, createContext, useContext } from 'react'
import { authService } from '@services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    initializeAuth()

    // Listen for auth state changes
    const unsubscribe = authService.addAuthStateListener((authState) => {
      setUser(authState.user)
      setIsAuthenticated(authState.isAuthenticated)
    })

    return unsubscribe
  }, [])

  const initializeAuth = async () => {
    setLoading(true)
    try {
      const user = await authService.initializeAuth()
      if (user) {
        setUser(user)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (googleToken = null) => {
    setLoading(true)
    try {
      let user

      if (googleToken) {
        // Direct token login (for testing or external integrations)
        user = await authService.loginWithToken(googleToken)
      } else {
        // Google OAuth login
        user = await authService.loginWithGoogle()
      }

      setUser(user)
      setIsAuthenticated(true)
      toast.success(`Welcome back, ${user.name}!`)

      return user
    } catch (error) {
      console.error('Login failed:', error)
      toast.error(error.message || 'Login failed. Please try again.')
      setUser(null)
      setIsAuthenticated(false)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Logout failed')
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData)
      setUser(updatedUser)
      toast.success('Profile updated successfully')
      return updatedUser
    } catch (error) {
      console.error('Profile update failed:', error)
      toast.error('Failed to update profile')
      throw error
    }
  }

  const checkAuth = async () => {
    setLoading(true)
    try {
      if (authService.isUserAuthenticated()) {
        const user = authService.getCurrentUser()
        setUser(user)
        setIsAuthenticated(true)
        return user
      } else {
        setUser(null)
        setIsAuthenticated(false)
        return null
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsAuthenticated(false)
      return null
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      await authService.refreshToken()
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      await logout()
      return false
    }
  }

  const hasPermission = async (permission, resourceType, resourceId) => {
    try {
      return await authService.hasPermission(permission, resourceType, resourceId)
    } catch (error) {
      console.error('Permission check failed:', error)
      return false
    }
  }

  // Development helper for mock login
  const mockLogin = async (email = 'developer@collabspace.dev') => {
    if (import.meta.env.NODE_ENV === 'development') {
      setLoading(true)
      try {
        const user = await authService.mockLogin(email)
        setUser(user)
        setIsAuthenticated(true)
        toast.success(`Mock login successful: ${user.name}`)
        return user
      } catch (error) {
        console.error('Mock login failed:', error)
        toast.error('Mock login failed')
        throw error
      } finally {
        setLoading(false)
      }
    }
  }

  const value = {
    // State
    user,
    loading,
    isAuthenticated,

    // Actions
    login,
    logout,
    updateUser,
    checkAuth,
    refreshToken,
    hasPermission,

    // Development helpers
    mockLogin: import.meta.env.NODE_ENV === 'development' ? mockLogin : undefined,

    // Computed values
    isAdmin: user?.role === 'ADMIN',
    isMember: user?.role === 'MEMBER' || user?.role === 'ADMIN',
    userEmail: user?.email,
    userName: user?.name,
    userPicture: user?.profilePicture
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default useAuth
