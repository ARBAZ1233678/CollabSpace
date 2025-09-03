import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline, Box } from '@mui/material'
import { Toaster } from 'react-hot-toast'

// Import pages/components
import Login from '@components/auth/Login'
import Dashboard from '@components/dashboard/Dashboard'
import DocumentEditor from '@components/document/DocumentEditor'
import MeetingRoom from '@components/meeting/MeetingRoom'
import Header from '@components/common/Header'
import Sidebar from '@components/common/Sidebar'
import Loading from '@components/common/Loading'

// Import hooks and services
import { useAuth } from '@hooks/useAuth'
import { SocketProvider } from '@services/socketService'
import ErrorBoundary from '@components/common/ErrorBoundary'

// Import styles
import '@styles/global.css'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

// Create Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E86AB',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#A23B72',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
})

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Main Layout Component
function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, // Account for header height
          ml: sidebarOpen ? { xs: 0, md: '240px' } : 0,
          transition: 'margin 0.3s ease',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <SocketProvider>
              <div className="App">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />

                  {/* Protected Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <Dashboard />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <Dashboard />
                        </MainLayout>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/document/:documentId"
                    element={
                      <ProtectedRoute>
                        <MainLayout>
                          <DocumentEditor />
                        </MainLayout>
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

                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {/* Toast notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#4CAF50',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#F44336',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
            </SocketProvider>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
