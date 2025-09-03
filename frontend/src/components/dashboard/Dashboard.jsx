import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Fab,
} from '@mui/material'
import {
  Add as AddIcon,
  Description as DocumentIcon,
  VideoCall as VideoIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  TrendingUp as AnalyticsIcon,
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import { useAuth } from '@hooks/useAuth'
import { apiService } from '@services/api'
import Loading from '@components/common/Loading'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [selectedTeam, setSelectedTeam] = useState(null)

  // Fetch user's teams
  const { data: teams = [], isLoading: teamsLoading } = useQuery(
    'teams',
    () => apiService.getTeams(),
    {
      onError: (error) => {
        toast.error('Failed to load teams')
        console.error('Error loading teams:', error)
      }
    }
  )

  // Fetch recent documents
  const { data: recentDocuments = [], isLoading: documentsLoading } = useQuery(
    ['documents', selectedTeam?.id],
    () => selectedTeam ? apiService.getTeamDocuments(selectedTeam.id) : Promise.resolve([]),
    {
      enabled: !!selectedTeam,
      onError: (error) => {
        toast.error('Failed to load documents')
        console.error('Error loading documents:', error)
      }
    }
  )

  // Fetch upcoming meetings
  const { data: upcomingMeetings = [], isLoading: meetingsLoading } = useQuery(
    ['meetings', selectedTeam?.id],
    () => selectedTeam ? apiService.getTeamMeetings(selectedTeam.id) : Promise.resolve([]),
    {
      enabled: !!selectedTeam,
      onError: (error) => {
        toast.error('Failed to load meetings')
        console.error('Error loading meetings:', error)
      }
    }
  )

  // Set default team when teams are loaded
  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0])
    }
  }, [teams, selectedTeam])

  const handleCreateDocument = () => {
    // Navigate to document creation
    toast.success('Creating new document...')
  }

  const handleScheduleMeeting = () => {
    // Navigate to meeting scheduling
    toast.success('Opening meeting scheduler...')
  }

  if (teamsLoading) {
    return <Loading />
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Here's what's happening with your team today
        </Typography>
      </Box>

      {/* Team Selector */}
      <Box sx={{ mb: 3 }}>
        {teams.map((team) => (
          <Chip
            key={team.id}
            label={team.name}
            color={selectedTeam?.id === team.id ? 'primary' : 'default'}
            onClick={() => setSelectedTeam(team)}
            sx={{ mr: 1, mb: 1 }}
          />
        ))}
      </Box>

      {/* Main Dashboard Grid */}
      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <DocumentIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{recentDocuments.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Documents
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <VideoIcon color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{upcomingMeetings.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Upcoming Meetings
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{selectedTeam?.membersCount || 0}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Team Members
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AnalyticsIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">98%</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Productivity Score
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Documents */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Documents</Typography>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                size="small"
                onClick={handleCreateDocument}
              >
                New Document
              </Button>
            </Box>

            {documentsLoading ? (
              <Loading />
            ) : recentDocuments.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No documents yet. Create your first document to get started!
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {recentDocuments.slice(0, 6).map((doc) => (
                  <Grid item xs={12} sm={6} key={doc.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" noWrap>
                          {doc.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Updated {new Date(doc.updatedAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          by {doc.lastModifiedByName}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small">Open</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Upcoming Meetings */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
              <Typography variant="h6">Upcoming Meetings</Typography>
              <IconButton size="small" onClick={handleScheduleMeeting}>
                <AddIcon />
              </IconButton>
            </Box>

            {meetingsLoading ? (
              <Loading />
            ) : upcomingMeetings.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No upcoming meetings scheduled.
              </Typography>
            ) : (
              upcomingMeetings.slice(0, 5).map((meeting) => (
                <Box key={meeting.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle2">{meeting.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(meeting.startTime).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {meeting.participantsCount} participants
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreateDocument}
      >
        <AddIcon />
      </Fab>
    </Container>
  )
}

export default Dashboard
