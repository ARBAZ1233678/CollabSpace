import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material'
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Email,
  Phone,
  LocationOn,
  Business,
  CalendarToday,
  Security,
  Notifications,
  Language,
  Delete
} from '@mui/icons-material'
import { useAuth } from '@hooks/useAuth'
import { apiService } from '@services/api'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

const validationSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().matches(/^[+]?[0-9\s-()]*$/, 'Invalid phone number'),
  location: yup.string(),
  company: yup.string(),
  bio: yup.string().max(500, 'Bio must be less than 500 characters')
})

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    meetingReminders: true,
    documentSharing: true,
    darkMode: false,
    language: 'en'
  })

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      company: user?.company || '',
      bio: user?.bio || ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        const updatedUser = await updateUser(values)
        toast.success('Profile updated successfully')
        setEditing(false)
      } catch (error) {
        console.error('Profile update failed:', error)
        toast.error('Failed to update profile')
      } finally {
        setLoading(false)
      }
    }
  })

  useEffect(() => {
    if (user) {
      formik.setValues({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        company: user.company || '',
        bio: user.bio || ''
      })
    }
  }, [user])

  const handlePreferenceChange = (key) => (event) => {
    setPreferences(prev => ({
      ...prev,
      [key]: event.target.checked
    }))
  }

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Handle avatar upload
      toast.info('Avatar upload functionality would be implemented here')
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 4 }}>
            <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Personal Information
              </Typography>
              {!editing ? (
                <Button
                  startIcon={<Edit />}
                  onClick={() => setEditing(true)}
                  variant="outlined"
                >
                  Edit Profile
                </Button>
              ) : (
                <Box display="flex" gap={1}>
                  <Button
                    startIcon={<Save />}
                    onClick={formik.handleSubmit}
                    variant="contained"
                    disabled={loading}
                  >
                    Save
                  </Button>
                  <Button
                    startIcon={<Cancel />}
                    onClick={() => {
                      setEditing(false)
                      formik.resetForm()
                    }}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={3} mb={3}>
                    <Avatar
                      src={user?.profilePicture}
                      sx={{ width: 80, height: 80 }}
                    >
                      {user?.name?.charAt(0)}
                    </Avatar>
                    {editing && (
                      <Box>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="avatar-upload"
                          type="file"
                          onChange={handleAvatarUpload}
                        />
                        <label htmlFor="avatar-upload">
                          <IconButton
                            color="primary"
                            aria-label="upload picture"
                            component="span"
                          >
                            <PhotoCamera />
                          </IconButton>
                        </label>
                      </Box>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Full Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email Address"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    disabled={true} // Email usually not editable
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="phone"
                    label="Phone Number"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="location"
                    label="Location"
                    value={formik.values.location}
                    onChange={formik.handleChange}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="company"
                    label="Company"
                    value={formik.values.company}
                    onChange={formik.handleChange}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <Business sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="bio"
                    label="Bio"
                    value={formik.values.bio}
                    onChange={formik.handleChange}
                    error={formik.touched.bio && Boolean(formik.errors.bio)}
                    helperText={formik.touched.bio && formik.errors.bio}
                    disabled={!editing}
                    placeholder="Tell us about yourself..."
                  />
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Account Information & Preferences */}
        <Grid item xs={12} md={4}>
          {/* Account Status */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Account Status
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" justifyContent="between" alignItems="center">
                <Typography variant="body2">Account Type</Typography>
                <Chip 
                  label={user?.role || 'Member'} 
                  color="primary" 
                  size="small" 
                />
              </Box>
              <Box display="flex" justifyContent="between" alignItems="center">
                <Typography variant="body2">Member Since</Typography>
                <Typography variant="body2" color="textSecondary">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="between" alignItems="center">
                <Typography variant="body2">Last Login</Typography>
                <Typography variant="body2" color="textSecondary">
                  {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Today'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Preferences */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Preferences
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Email Notifications"
                  secondary="Receive email updates"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.emailNotifications}
                    onChange={handlePreferenceChange('emailNotifications')}
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemText 
                  primary="Push Notifications"
                  secondary="Browser notifications"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.pushNotifications}
                    onChange={handlePreferenceChange('pushNotifications')}
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemText 
                  primary="Meeting Reminders"
                  secondary="Get reminded before meetings"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.meetingReminders}
                    onChange={handlePreferenceChange('meetingReminders')}
                  />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem>
                <ListItemText 
                  primary="Document Sharing"
                  secondary="Allow others to share docs with you"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={preferences.documentSharing}
                    onChange={handlePreferenceChange('documentSharing')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Profile
