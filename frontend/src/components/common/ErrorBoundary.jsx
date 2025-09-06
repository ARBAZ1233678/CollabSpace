import React from 'react'
import { Box, Typography, Button, Alert, Container } from '@mui/material'
import { ErrorOutline, Refresh } from '@mui/icons-material'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Log to external error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo)
      console.error('Production error logged:', error.message)
    }
  }

  handleReload = () => {
    // Reload the page to recover from error
    window.location.reload()
  }

  handleReset = () => {
    // Reset error boundary state
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="60vh"
            textAlign="center"
          >
            <ErrorOutline 
              sx={{ 
                fontSize: 80, 
                color: 'error.main', 
                mb: 2 
              }} 
            />

            <Typography variant="h4" gutterBottom>
              Oops! Something went wrong
            </Typography>

            <Typography variant="body1" color="textSecondary" sx={{ mb: 3, maxWidth: 600 }}>
              We're sorry for the inconvenience. The application encountered an unexpected error. 
              Our team has been notified and is working to fix this issue.
            </Typography>

            <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
              <Typography variant="body2">
                <strong>Error:</strong> {this.state.error?.message || 'Unknown error occurred'}
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Refresh />}
                onClick={this.handleReload}
                size="large"
              >
                Reload Page
              </Button>

              <Button
                variant="outlined"
                color="primary"
                onClick={this.handleReset}
                size="large"
              >
                Try Again
              </Button>

              <Button
                variant="text"
                color="primary"
                onClick={() => window.location.href = '/'}
                size="large"
              >
                Go Home
              </Button>
            </Box>

            {/* Debug information for development */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1, maxWidth: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Debug Information (Development Only)
                </Typography>
                <Typography 
                  variant="body2" 
                  component="pre" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.8rem',
                    overflow: 'auto',
                    maxHeight: '200px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {this.state.error && this.state.error.stack}

                  {this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      )
    }

    // Render children normally when there's no error
    return this.props.children
  }
}

export default ErrorBoundary
