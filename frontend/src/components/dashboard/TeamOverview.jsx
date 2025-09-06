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
  Avatar,
  AvatarGroup,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  Badge,
  Tooltip
} from '@mui/material'
import {
  MoreVert,
  Add,
  People,
  Assignment,
  TrendingUp,
  CheckCircle,
  Schedule,
  Group,
  PersonAdd,
  Settings,
  Analytics,
  Notifications
} from '@mui/icons-material'
import { useAuth } from '@hooks/useAuth'
import { apiService } from '@services/api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const TeamOverview = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [teamProjects, setTeamProjects] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock data for development
  const mockTeams = [
    {
      id: 1,
      name: 'Development Team',
      description: 'Frontend and Backend development',
      memberCount: 8,
      activeProjects: 3,
      completedTasks: 45,
      totalTasks: 60,
      role: 'Admin',
      members: [
        { id: 1, name: 'John Doe', role: 'Lead Developer', avatar: '', status: 'online' },
        { id: 2, name: 'Jane Smith', role: 'Frontend Developer', avatar: '', status: 'away' },
        { id: 3, name: 'Bob Johnson', role: 'Backend Developer', avatar: '', status: 'online' },
        { id: 4, name: 'Alice Brown', role: 'DevOps Engineer', avatar: '', status: 'offline' }
      ]
    },
    {
      id: 2,
      name: 'Design Team',
      description: 'UI/UX Design and Creative',
      memberCount: 5,
      activeProjects: 2,
      completedTasks: 32,
      totalTasks: 40,
      role: 'Member',
      members: [
        { id: 5, name: 'Carol Wilson', role: 'UI Designer', avatar: '', status: 'online' },
        { id: 6, name: 'David Lee', role: 'UX Designer', avatar: '', status: 'online' },
        { id: 7, name: 'Eva Garcia', role: 'Graphic Designer', avatar: '', status: 'away' }
      ]
    }
  ]

  const mockActivity = [
    { id: 1, user: 'John Doe', action: 'completed task', target: 'API Integration', time: '2 hours ago' },
    { id: 2, user: 'Jane Smith', action: 'uploaded document', target: 'Design Guidelines', time: '4 hours ago' },
    { id: 3, user: 'Bob Johnson', action: 'started meeting', target: 'Sprint Planning', time: '1 day ago' },
    { id: 4, user: 'Alice Brown', action: 'joined team', target: 'Development Team', time: '2 days ago' }
  ]

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    setLoading(true)
    try {
      const teamsData = await apiService.getTeams()
      setTeams(teamsData)
      if (teamsData.length > 0) {
        setSelectedTeam(teamsData[0])
        await loadTeamDetails(teamsData[0].id)
      }
    } catch (error) {
      // Use mock data for development
      console.log('Using mock team data')
      setTeams(mockTeams)
      setSelectedTeam(mockTeams[0])
      setTeamMembers(mockTeams[0].members)
      setRecentActivity(mockActivity)
    } finally {
      setLoading(false)
    }
  }

  const loadTeamDetails = async (teamId) => {
    try {
      const members = await apiService.getTeamMembers(teamId)
      setTeamMembers(members)
    } catch (error) {
      console.error('Failed to load team details:', error)
    }
  }

  const handleTeamMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleTeamMenuClose = () => {
    setAnchorEl(null)
  }

  const handleCreateTeam = () => {
    toast.info('Create team functionality would be implemented here')
  }

  const handleInviteMember = () => {
    toast.info('Invite member functionality would be implemented here')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success'
      case 'away': return 'warning'
      case 'offline': return 'error'
      default: return 'default'
    }
  }

  const TeamCard = ({ team }) => (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {team.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {team.description}
            </Typography>
          </Box>
          <Chip 
            label={team.role} 
            color={team.role === 'Admin' ? 'primary' : 'default'}
            size="small"
          />
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <AvatarGroup max={4}>
            {team.members?.slice(0, 4).map((member) => (
              <Tooltip key={member.id} title={member.name}>
                <Badge
                  color={getStatusColor(member.status)}
                  variant="dot"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32 }} src={member.avatar}>
                    {member.name.charAt(0)}
                  </Avatar>
                </Badge>
              </Tooltip>
            ))}
          </AvatarGroup>
          <Typography variant="body2" color="textSecondary">
            {team.memberCount} members
          </Typography>
        </Box>

        <Box mb={2}>
          <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
            <Typography variant="body2" color="textSecondary">
              Project Progress
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {Math.round((team.completedTasks / team.totalTasks) * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(team.completedTasks / team.totalTasks) * 100}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="h6" color="primary.main" fontWeight={600}>
                {team.activeProjects}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Active Projects
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center">
              <Typography variant="h6" color="success.main" fontWeight={600}>
                {team.completedTasks}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Tasks Done
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <CardActions>
        <Button 
          size="small" 
          onClick={() => navigate(`/team/${team.id}`)}
        >
          View Details
        </Button>
        <Button 
          size="small" 
          onClick={() => navigate(`/team/${team.id}/analytics`)}
          startIcon={<Analytics />}
        >
          Analytics
        </Button>
        <IconButton 
          size="small" 
          onClick={handleTeamMenuOpen}
          sx={{ ml: 'auto' }}
        >
          <MoreVert />
        </IconButton>
      </CardActions>
    </Card>
  )

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading teams...
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Team Overview
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your teams and track collaboration
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<PersonAdd />}
            onClick={handleInviteMember}
          >
            Invite Member
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateTeam}
          >
            Create Team
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Teams Grid */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Your Teams ({teams.length})
          </Typography>
          <Grid container spacing={3}>
            {teams.map((team) => (
              <Grid item xs={12} md={6} key={team.id}>
                <TeamCard team={team} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Recent Activity
            </Typography>
            <List>
              {recentActivity.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {activity.user.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          <strong>{activity.user}</strong> {activity.action} <em>{activity.target}</em>
                        </Typography>
                      }
                      secondary={activity.time}
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Team Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleTeamMenuClose}
      >
        <MenuItem onClick={handleTeamMenuClose}>
          <Settings sx={{ mr: 1 }} />
          Team Settings
        </MenuItem>
        <MenuItem onClick={handleTeamMenuClose}>
          <PersonAdd sx={{ mr: 1 }} />
          Invite Members
        </MenuItem>
        <MenuItem onClick={handleTeamMenuClose}>
          <Analytics sx={{ mr: 1 }} />
          View Analytics
        </MenuItem>
      </Menu>
    </Container>
  )
}

export default TeamOverview
