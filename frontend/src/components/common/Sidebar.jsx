import React from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Chip,
  Avatar,
  AvatarGroup
} from '@mui/material'
import {
  Dashboard,
  Description,
  VideoCall,
  People,
  Analytics,
  Settings,
  Folder,
  Schedule,
  Chat
} from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'

const DRAWER_WIDTH = 240

const Sidebar = ({ open, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { 
      title: 'Dashboard', 
      icon: <Dashboard />, 
      path: '/dashboard',
      description: 'Overview and activity'
    },
    { 
      title: 'Documents', 
      icon: <Description />, 
      path: '/documents',
      description: 'Shared documents',
      badge: 5
    },
    { 
      title: 'Meetings', 
      icon: <VideoCall />, 
      path: '/meetings',
      description: 'Video conferences',
      badge: 2
    },
    { 
      title: 'Teams', 
      icon: <People />, 
      path: '/teams',
      description: 'Team management'
    },
    { 
      title: 'Projects', 
      icon: <Folder />, 
      path: '/projects',
      description: 'Project workspaces'
    },
    { 
      title: 'Schedule', 
      icon: <Schedule />, 
      path: '/schedule',
      description: 'Calendar and events'
    },
    { 
      title: 'Chat', 
      icon: <Chat />, 
      path: '/chat',
      description: 'Team messaging'
    }
  ]

  const handleNavigation = (path) => {
    navigate(path)
    onClose?.()
  }

  const isActive = (path) => location.pathname === path

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: 'background.default',
          borderRight: '1px solid',
          borderColor: 'divider',
          mt: 8, // Account for header height
        },
      }}
    >
      {/* Sidebar Header */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Workspace
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Development Team
        </Typography>

        {/* Team Members */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="textSecondary" gutterBottom display="block">
            Team Members (4 online)
          </Typography>
          <AvatarGroup max={6} sx={{ justifyContent: 'flex-start' }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>J</Avatar>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>A</Avatar>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>M</Avatar>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.main' }}>S</Avatar>
          </AvatarGroup>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, p: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText'
                    },
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  secondary={!isActive(item.path) ? item.description : undefined}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: isActive(item.path) ? 600 : 400
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption'
                  }}
                />
                {item.badge && (
                  <Chip 
                    label={item.badge} 
                    size="small" 
                    color="primary"
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem',
                      backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.2)' : undefined
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      {/* Footer Section */}
      <Box sx={{ p: 2 }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation('/analytics')}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Analytics />
              </ListItemIcon>
              <ListItemText 
                primary="Analytics"
                secondary="Team insights"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation('/settings')}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Settings />
              </ListItemIcon>
              <ListItemText 
                primary="Settings"
                secondary="Preferences"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  )
}

export default Sidebar
