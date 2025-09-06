import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress,
  Divider
} from '@mui/material'
import { Google as GoogleIcon } from '@mui/icons-material'
import { googleService } from '@services/googleService'
import { useAuth } from '@hooks/useAuth'
import toast from 'react-hot-toast'

const GoogleAuth = ({ onSuccess, onError, buttonText = "Continue with Google" }) => {
  const [loading, setLoading] = useState(false)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const { login } = useAuth()

  useEffect(() => {
    initializeGoogle()
  }, [])

  const initializeGoogle = async () => {
    try {
      await googleService.initialize()
      setIsGoogleLoaded(true)
    } catch (error) {
      console.error('Failed to initialize Google:', error)
      toast.error('Failed to load Google authentication')
    }
  }

  const handleGoogleSignIn = async () => {
    if (!isGoogleLoaded) {
      toast.error('Google authentication is not ready')
      return
    }

    setLoading(true)
    try {
      const googleAuth = await googleService.signIn()

      // Use the login method from useAuth hook
      const user = await login(googleAuth.idToken)

      toast.success(`Welcome, ${user.name}!`)

      if (onSuccess) {
        onSuccess(user)
      }
    } catch (error) {
      console.error('Google sign-in failed:', error)
      const message = error.message || 'Google sign-in failed. Please try again.'
      toast.error(message)

      if (onError) {
        onError(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      // Demo login for development/testing
      const demoUser = await login('demo-token')
      toast.success(`Demo login successful: ${demoUser.name}`)

      if (onSuccess) {
        onSuccess(demoUser)
      }
    } catch (error) {
      console.error('Demo login failed:', error)
      toast.error('Demo login failed')

      if (onError) {
        onError(error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Welcome to CollabSpace
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Sign in to access your workspace
        </Typography>
      </Box>

      {!isGoogleLoaded && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading Google authentication...
        </Alert>
      )}

      <Box display="flex" flexDirection="column" gap={2}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleGoogleSignIn}
          disabled={loading || !isGoogleLoaded}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            textTransform: 'none',
            backgroundColor: '#4285f4',
            '&:hover': {
              backgroundColor: '#3367d6'
            }
          }}
        >
          {loading ? 'Signing in...' : buttonText}
        </Button>

        {process.env.NODE_ENV === 'development' && (
          <>
            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Development Only
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleDemoLogin}
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none'
              }}
            >
              Demo Login
            </Button>
          </>
        )}
      </Box>

      <Box mt={3} textAlign="center">
        <Typography variant="caption" color="textSecondary">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </Box>
    </Paper>
  )
}

export default GoogleAuth
