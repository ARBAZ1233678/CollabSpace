import React from 'react'
import { Box, CircularProgress, Typography, Fade } from '@mui/material'

const Loading = ({ 
  message = 'Loading...', 
  size = 40, 
  color = 'primary',
  showMessage = true,
  fullScreen = false 
}) => {
  const containerProps = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    bgcolor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 9999
  } : {
    minHeight: '200px'
  }

  return (
    <Fade in timeout={300}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
        sx={containerProps}
      >
        <CircularProgress size={size} color={color} />
        {showMessage && (
          <Typography 
            variant="body2" 
            color="textSecondary"
            sx={{ 
              fontWeight: 500,
              letterSpacing: '0.5px'
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Fade>
  )
}

export default Loading
