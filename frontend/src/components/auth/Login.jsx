import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Container,
  Paper, 
  Typography, 
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Link,
  IconButton,
  InputAdornment
} from '@mui/material'
import { 
  Visibility, 
  VisibilityOff,
  Google as GoogleIcon,
  Business,
  Security,
  Speed
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import GoogleAuth from '@components/auth/GoogleAuth'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

const validationSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
})

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, mockLogin, loading: authLoading, isAuthenticated } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [loginMode, setLoginMode] = useState('oauth') // 'oauth' or 'credentials'
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        await login(values.email, values.password)
        const from = location.state?.from?.pathname || '/dashboard'
        navigate(from, { replace: true })
      } catch (error) {
        toast.error(error.message || 'Login failed')
      } finally {
        setLoading(false)
      }
    }
  })

  const handleGoogleSuccess = (user) => {
    const from = location.state?.from?.pathname || '/dashboard'
    navigate(from, { replace: true })
  }

  const handleGoogleError = (error) => {
    toast.error('Google sign-in failed. Please try again.')
  }

  const handleDemoLogin = async () => {
    if (process.env.NODE_ENV === 'development' && mockLogin) {
      setLoading(true)
      try {
        await mockLogin('demo@collabspace.dev')
        const from = location.state?.from?.pathname || '/dashboard'
        navigate(from, { replace: true })
      } catch (error) {
        toast.error('Demo login failed')
      } finally {
        setLoading(false)
      }
    }
  }

  if (authLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={10}
          sx={{ 
            p: 4, 
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              CollabSpace
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Enterprise Team Collaboration
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Sign in to access your workspace
            </Typography>
          </Box>

          {/* Login Methods Toggle */}
          <Box display="flex" gap={1} mb={3}>
            <Button
              fullWidth
              variant={loginMode === 'oauth' ? 'contained' : 'outlined'}
              onClick={() => setLoginMode('oauth')}
              disabled={loading}
            >
              OAuth Login
            </Button>
            <Button
              fullWidth
              variant={loginMode === 'credentials' ? 'contained' : 'outlined'}
              onClick={() => setLoginMode('credentials')}
              disabled={loading}
            >
              Email & Password
            </Button>
          </Box>

          {/* OAuth Login */}
          {loginMode === 'oauth' && (
            <Box>
              <GoogleAuth 
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                buttonText="Sign in with Google"
              />

              {process.env.NODE_ENV === 'development' && (
                <>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                      Development Only
                    </Typography>
                  </Divider>

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleDemoLogin}
                    disabled={loading}
                    sx={{ mb: 2 }}
                  >
                    Demo Login (No Setup Required)
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Credentials Login */}
          {loginMode === 'credentials' && (
            <Box component="form" onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={loading}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{ mb: 2, py: 1.5 }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Box textAlign="center">
                <Link href="#" variant="body2" onClick={(e) => {
                  e.preventDefault()
                  toast.info('Password reset functionality would be implemented here')
                }}>
                  Forgot your password?
                </Link>
              </Box>
            </Box>
          )}

          {/* Features */}
          <Divider sx={{ my: 4 }}>
            <Typography variant="caption" color="textSecondary">
              Platform Features
            </Typography>
          </Divider>

          <Box display="flex" justifyContent="space-around" mb={3}>
            <Box textAlign="center">
              <Business color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="caption" display="block">
                Enterprise Ready
              </Typography>
            </Box>
            <Box textAlign="center">
              <Security color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="caption" display="block">
                Secure by Design
              </Typography>
            </Box>
            <Box textAlign="center">
              <Speed color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="caption" display="block">
                Real-time Collaboration
              </Typography>
            </Box>
          </Box>

          {/* Footer */}
          <Box textAlign="center" mt={3}>
            <Typography variant="caption" color="textSecondary">
              Don't have an account?{' '}
              <Link href="#" onClick={(e) => {
                e.preventDefault()
                toast.info('Contact your administrator for access')
              }}>
                Contact Administrator
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login
