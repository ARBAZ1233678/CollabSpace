import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, Button } from '@mui/material'
import { Toaster } from 'react-hot-toast'

// Providers
import { AuthProvider } from '@hooks/useAuth'
import { SocketProvider } from '@services/socketService'

// Components
import Loading from '@components/common/Loading'
import ErrorBoundary from '@components/common/ErrorBoundary'
import Header from '@components/common/Header'
import Sidebar from '@components/common/Sidebar'

// Auth Components
import Login from '@components/auth/Login'

// Main App Components
import Dashboard from '@components/dashboard/Dashboard'
import Profile from '@components/auth/Profile'
import Analytics from '@components/dashboard/Analytics'
import TeamOverview from '@components/dashboard/TeamOverview'

// Document Components
import DocumentList from '@components/document/DocumentList'
import DocumentEditor from '@components/document/DocumentEditor'
import CollaborativeEditor from '@components/document/CollaborativeEditor'

// Meeting Components  
import MeetingList from '@components/meeting/MeetingList'
import MeetingRoom from '@components/meeting/MeetingRoom'
import VideoCall from '@components/meeting/VideoCall'

// Hooks
import { useAuth } from '@hooks/useAuth'

// Utilities
import { THEME_CONFIG } from '@utils/constants'

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: THEME_CONFIG.PRIMARY_COLOR,
    },
    secondary: {
      main: THEME_CONFIG.SECONDARY_COLOR,
    },
    success: {
      main: THEME_CONFIG.SUCCESS_COLOR,
    },
    warning: {
      main: THEME_CONFIG.WARNING_COLOR,
    },
    error: {
      main: THEME_CONFIG.ERROR_COLOR,
    },
    info: {
      main: THEME_CONFIG.INFO_COLOR,
    },
  },
  typography: {
    fontFamily: THEME_CONFIG.FONT_FAMILY,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
})

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Loading message="Checking authentication..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Loading message="Loading..." />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Main App Layout Component
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleSidebarToggle = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(!mobileOpen)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onMenuClick={handleSidebarToggle} />

      <Sidebar 
        open={sidebarOpen}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, // Account for header height
          ml: { xs: 0, md: sidebarOpen ? '240px' : 0 },
          transition: theme => theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

// Main App Component
const AppContent = () => {
  const { initializeAuth } = useAuth()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Analytics />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/teams" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <TeamOverview />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* Document Routes */}
        <Route 
          path="/documents" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <DocumentList />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/document/:documentId" 
          element={
            <ProtectedRoute>
              <DocumentEditor />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/document/:documentId/collaborate" 
          element={
            <ProtectedRoute>
              <CollaborativeEditor />
            </ProtectedRoute>
          } 
        />

        {/* Meeting Routes */}
        <Route 
          path="/meetings" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <MeetingList />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/meeting/:meetingId" 
          element={
            <ProtectedRoute>
              <MeetingRoom />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/call/:callId" 
          element={
            <ProtectedRoute>
              <VideoCall />
            </ProtectedRoute>
          } 
        />

        {/* Team Routes */}
        <Route 
          path="/team/:teamId" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <TeamOverview />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/team/:teamId/analytics" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Analytics />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* Settings Routes */}
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 Route */}
        <Route 
          path="*" 
          element={
            <AppLayout>
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                minHeight="60vh"
                textAlign="center"
              >
                <Typography variant="h4" gutterBottom>
                  404 - Page Not Found
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  The page you're looking for doesn't exist.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => window.history.back()}
                  sx={{ mt: 2 }}
                >
                  Go Back
                </Button>
              </Box>
            </AppLayout>
          } 
        />
      </Routes>
    </Router>
  )
}

// Root App Component with all providers
const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <SocketProvider>
            <Suspense fallback={<Loading message="Loading application..." />}>
              <AppContent />
            </Suspense>

            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: {
                    primary: THEME_CONFIG.SUCCESS_COLOR,
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: THEME_CONFIG.ERROR_COLOR,
                    secondary: '#fff',
                  },
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
