import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Badge,
  Tooltip,
  Button
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Settings,
  Logout,
  VideoCall,
  Add
} from '@mui/icons-material'
import { useAuth } from '@hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const Header = ({ onMenuClick }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationsAnchor, setNotificationsAnchor] = useState(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget)
  }

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null)
  }

  const handleLogout = async () => {
    handleProfileMenuClose()
    await logout()
    navigate('/login')
  }

  const handleStartMeeting = () => {
    // Navigate to meeting creation or start instant meeting
    navigate('/meeting/new')
  }

  const handleCreateDocument = () => {
    // Navigate to document creation
    navigate('/document/new')
  }

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar>
        {/* Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography 
            variant="h6" 
            noWrap 
            component="div"
            sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2E86AB, #A23B72)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            CollabSpace
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
          <Tooltip title="Create Document">
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={handleCreateDocument}
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none'
              }}
            >
              Document
            </Button>
          </Tooltip>

          <Tooltip title="Start Meeting">
            <Button
              variant="contained"
              size="small"
              startIcon={<VideoCall />}
              onClick={handleStartMeeting}
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none'
              }}
            >
              Meet
            </Button>
          </Tooltip>
        </Box>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            color="inherit"
            onClick={handleNotificationsOpen}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Profile Menu */}
        <Tooltip title="Profile">
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
            sx={{ p: 0 }}
          >
            {user?.profilePicture ? (
              <Avatar 
                src={user.profilePicture} 
                alt={user.name}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            )}
          </IconButton>
        </Tooltip>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
              mt: 1.5,
              minWidth: 200,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" noWrap>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="body2" color="textSecondary" noWrap>
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>

          <MenuItem onClick={() => navigate('/profile')}>
            <AccountCircle sx={{ mr: 1 }} />
            Profile
          </MenuItem>

          <MenuItem onClick={() => navigate('/settings')}>
            <Settings sx={{ mr: 1 }} />
            Settings
          </MenuItem>

          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 300,
              maxHeight: 400
            }
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Notifications</Typography>
          </Box>

          {/* Sample notifications - replace with real data */}
          <MenuItem>
            <Box>
              <Typography variant="body2">
                New document shared: "Q4 Planning"
              </Typography>
              <Typography variant="caption" color="textSecondary">
                2 minutes ago
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem>
            <Box>
              <Typography variant="body2">
                Meeting starts in 10 minutes
              </Typography>
              <Typography variant="caption" color="textSecondary">
                8 minutes ago
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem>
            <Box>
              <Typography variant="body2">
                Task assigned: "Review API documentation"
              </Typography>
              <Typography variant="caption" color="textSecondary">
                1 hour ago
              </Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Header
