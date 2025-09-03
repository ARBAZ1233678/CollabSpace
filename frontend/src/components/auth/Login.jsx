import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material'
import { Google as GoogleIcon } from '@mui/icons-material'
import { useAuth } from '@hooks/useAuth'
import toast from 'react-hot-toast'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      // In a real app, you would integrate with Google OAuth
      // For now, we'll simulate a login
      const mockGoogleToken = 'mock-google-token-for-development'

      await login(mockGoogleToken)
      toast.success('Welcome to CollabSpace!')
      navigate('/dashboard')
    } catch (err) {
      setError('Login failed. Please try again.')
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Logo and Title */}
          <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            CollabSpace
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
            Enterprise Team Collaboration
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Stack spacing={3} sx={{ width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleGoogleLogin}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
              }}
            >
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            <Typography variant="body2" color="textSecondary" textAlign="center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Stack>

          {/* Features List */}
          <Box sx={{ mt: 4, width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Features:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">• Real-time document collaboration</Typography>
              <Typography variant="body2">• Video conferencing with screen sharing</Typography>
              <Typography variant="body2">• AI-powered meeting summaries</Typography>
              <Typography variant="body2">• Google Workspace integration</Typography>
              <Typography variant="body2">• Team analytics and insights</Typography>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login
