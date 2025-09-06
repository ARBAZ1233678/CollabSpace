import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  AvatarGroup,
  TextField,
  InputAdornment,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider
} from '@mui/material'
import {
  Add,
  Search,
  MoreVert,
  VideoCall,
  Schedule,
  People,
  AccessTime,
  Edit,
  Delete,
  Share,
  PlayArrow,
  Stop,
  EventNote,
  CalendarToday,
  FilterList
} from '@mui/icons-material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useAuth } from '@hooks/useAuth'
import { apiService } from '@services/api'
import { useNavigate } from 'react-router-dom'
import { format, formatDistanceToNow, isToday, isTomorrow, isThisWeek } from 'date-fns'
import toast from 'react-hot-toast'

const MeetingList = ({ teamId }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [meetings, setMeetings] = useState([])
  const [filteredMeetings, setFilteredMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    duration: 60,
    participants: []
  })

  useEffect(() => {
    loadMeetings()
  }, [teamId])

  useEffect(() => {
    filterMeetings()
  }, [meetings, searchQuery, filterStatus])

  const loadMeetings = async () => {
    setLoading(true)
    try {
      const meetingsData = await apiService.getTeamMeetings(teamId || 1)
      setMeetings(Array.isArray(meetingsData) ? meetingsData : meetingsData.meetings || [])
    } catch (error) {
      console.error('Failed to load meetings:', error)
      toast.error('Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }

  const filterMeetings = () => {
    let filtered = meetings

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(meeting =>
        meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (meeting.description && meeting.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(meeting => meeting.status === filterStatus)
    }

    // Sort by start time
    filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

    setFilteredMeetings(filtered)
  }

  const handleMeetingMenuOpen = (event, meeting) => {
    event.stopPropagation()
    setSelectedMeeting(meeting)
    setAnchorEl(event.currentTarget)
  }

  const handleMeetingMenuClose = () => {
    setSelectedMeeting(null)
    setAnchorEl(null)
  }

  const handleCreateMeeting = async () => {
    if (!newMeeting.title.trim()) {
      toast.error('Meeting title is required')
      return
    }

    try {
      const meeting = await apiService.createMeeting({
        ...newMeeting,
        teamId: teamId || 1,
        endTime: new Date(new Date(newMeeting.startTime).getTime() + newMeeting.duration * 60000)
      })

      setMeetings(prev => [meeting, ...prev])
      setCreateDialogOpen(false)
      setNewMeeting({
        title: '',
        description: '',
        startTime: new Date(),
        duration: 60,
        participants: []
      })
      toast.success('Meeting scheduled successfully')
    } catch (error) {
      console.error('Failed to create meeting:', error)
      toast.error('Failed to schedule meeting')
    }
  }

  const handleJoinMeeting = (meeting) => {
    navigate(`/meeting/${meeting.id}`)
  }

  const handleStartMeeting = async (meeting) => {
    try {
      await apiService.startMeeting(meeting.id)
      toast.success('Meeting started')
      navigate(`/meeting/${meeting.id}`)
    } catch (error) {
      console.error('Failed to start meeting:', error)
      toast.error('Failed to start meeting')
    }
  }

  const handleDeleteMeeting = async (meeting) => {
    if (window.confirm(`Are you sure you want to delete "${meeting.title}"?`)) {
      try {
        await apiService.deleteMeeting(meeting.id)
        setMeetings(prev => prev.filter(m => m.id !== meeting.id))
        toast.success('Meeting deleted successfully')
      } catch (error) {
        console.error('Failed to delete meeting:', error)
        toast.error('Failed to delete meeting')
      }
    }
    handleMeetingMenuClose()
  }

  const getMeetingStatus = (meeting) => {
    const now = new Date()
    const startTime = new Date(meeting.startTime)
    const endTime = meeting.endTime ? new Date(meeting.endTime) : new Date(startTime.getTime() + 60 * 60000)

    if (meeting.status === 'CANCELLED') return { status: 'CANCELLED', color: 'error' }
    if (meeting.status === 'COMPLETED') return { status: 'COMPLETED', color: 'success' }
    if (now >= startTime && now <= endTime) return { status: 'IN_PROGRESS', color: 'warning' }
    if (now < startTime) return { status: 'SCHEDULED', color: 'info' }
    if (now > endTime) return { status: 'ENDED', color: 'default' }

    return { status: 'UNKNOWN', color: 'default' }
  }

  const formatMeetingTime = (startTime) => {
    const date = new Date(startTime)

    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`
    } else if (isThisWeek(date)) {
      return format(date, "EEEE 'at' h:mm a")
    } else {
      return format(date, "MMM d 'at' h:mm a")
    }
  }

  const MeetingCard = ({ meeting }) => {
    const status = getMeetingStatus(meeting)

    return (
      <Card 
        elevation={2} 
        sx={{ 
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4
          }
        }}
        onClick={() => handleJoinMeeting(meeting)}
      >
        <CardContent>
          <Box display="flex" justifyContent="between" alignItems="flex-start" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <VideoCall color="primary" />
              <Chip 
                label={status.status}
                color={status.color}
                size="small"
              />
            </Box>
            <IconButton 
              size="small"
              onClick={(e) => handleMeetingMenuOpen(e, meeting)}
            >
              <MoreVert />
            </IconButton>
          </Box>

          <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
            {meeting.title}
          </Typography>

          <Typography 
            variant="body2" 
            color="textSecondary" 
            sx={{ 
              height: 40, 
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 2
            }}
          >
            {meeting.description || 'No description provided'}
          </Typography>

          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Schedule color="action" fontSize="small" />
            <Typography variant="body2" color="textSecondary">
              {formatMeetingTime(meeting.startTime)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <AccessTime color="action" fontSize="small" />
            <Typography variant="body2" color="textSecondary">
              {meeting.durationMinutes || 60} minutes
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="between">
            <Box display="flex" alignItems="center" gap={1}>
              <People color="action" fontSize="small" />
              <Typography variant="body2" color="textSecondary">
                {meeting.participantsCount || 0} participants
              </Typography>
            </Box>

            {meeting.participants && meeting.participants.length > 0 && (
              <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                {meeting.participants.map((participant, index) => (
                  <Avatar key={index} sx={{ width: 24, height: 24 }}>
                    {participant.name?.charAt(0) || 'U'}
                  </Avatar>
                ))}
              </AvatarGroup>
            )}
          </Box>
        </CardContent>

        <CardActions>
          {status.status === 'SCHEDULED' && new Date(meeting.startTime) <= new Date() && (
            <Button 
              size="small" 
              startIcon={<PlayArrow />}
              onClick={(e) => {
                e.stopPropagation()
                handleStartMeeting(meeting)
              }}
            >
              Start Meeting
            </Button>
          )}
          {(status.status === 'IN_PROGRESS' || status.status === 'SCHEDULED') && (
            <Button 
              size="small" 
              startIcon={<VideoCall />}
              onClick={(e) => {
                e.stopPropagation()
                handleJoinMeeting(meeting)
              }}
            >
              Join
            </Button>
          )}
          <Button 
            size="small" 
            startIcon={<EventNote />}
            onClick={(e) => {
              e.stopPropagation()
              // Navigate to meeting details/edit
            }}
          >
            Details
          </Button>
        </CardActions>
      </Card>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Meetings
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Schedule and join team meetings
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Schedule Meeting
          </Button>
        </Box>

        {/* Filters and Search */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Meetings</MenuItem>
                  <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="textSecondary" textAlign="center">
                {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Meetings */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <Typography>Loading meetings...</Typography>
          </Box>
        ) : filteredMeetings.length === 0 ? (
          <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
            <VideoCall sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {meetings.length === 0 ? 'No meetings scheduled' : 'No meetings match your search'}
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={3}>
              {meetings.length === 0 ? 'Schedule your first meeting to get started' : 'Try adjusting your search or filters'}
            </Typography>
            {meetings.length === 0 && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Schedule Meeting
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredMeetings.map((meeting) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={meeting.id}>
                <MeetingCard meeting={meeting} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="schedule meeting"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setCreateDialogOpen(true)}
        >
          <Add />
        </Fab>

        {/* Meeting Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMeetingMenuClose}
        >
          <MenuItem onClick={() => {
            handleJoinMeeting(selectedMeeting)
            handleMeetingMenuClose()
          }}>
            <VideoCall sx={{ mr: 1 }} />
            Join Meeting
          </MenuItem>
          <MenuItem onClick={handleMeetingMenuClose}>
            <Edit sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleMeetingMenuClose}>
            <Share sx={{ mr: 1 }} />
            Share
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => handleDeleteMeeting(selectedMeeting)}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Create Meeting Dialog */}
        <Dialog 
          open={createDialogOpen} 
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Schedule New Meeting</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meeting Title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Start Time"
                  value={newMeeting.startTime}
                  onChange={(date) => setNewMeeting(prev => ({ ...prev, startTime: date }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Duration (minutes)"
                  value={newMeeting.duration}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  inputProps={{ min: 15, max: 480, step: 15 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateMeeting}
              variant="contained"
              disabled={!newMeeting.title.trim()}
            >
              Schedule Meeting
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  )
}

export default MeetingList
