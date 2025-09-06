import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  People,
  Description,
  VideoCall,
  Schedule,
  Analytics as AnalyticsIcon,
  Assignment,
  Timer,
  CheckCircle
} from '@mui/icons-material'
import { useAuth } from '@hooks/useAuth'
import { apiService } from '@services/api'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const Analytics = () => {
  const { user } = useAuth()
  const [selectedTeam, setSelectedTeam] = useState('all')
  const [dateRange, setDateRange] = useState('7d')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock analytics data
  const mockAnalytics = {
    overview: {
      totalDocuments: 127,
      documentsChange: 12,
      totalMeetings: 45,
      meetingsChange: -3,
      activeUsers: 23,
      usersChange: 5,
      productivity: 87,
      productivityChange: 8
    },
    activityData: [
      { name: 'Mon', documents: 12, meetings: 4, users: 18 },
      { name: 'Tue', documents: 19, meetings: 6, users: 22 },
      { name: 'Wed', documents: 15, meetings: 3, users: 19 },
      { name: 'Thu', documents: 22, meetings: 8, users: 25 },
      { name: 'Fri', documents: 18, meetings: 5, users: 21 },
      { name: 'Sat', documents: 8, meetings: 2, users: 12 },
      { name: 'Sun', documents: 5, meetings: 1, users: 8 }
    ],
    documentTypes: [
      { name: 'Documents', value: 45, color: '#2196F3' },
      { name: 'Spreadsheets', value: 25, color: '#4CAF50' },
      { name: 'Presentations', value: 20, color: '#FF9800' },
      { name: 'Code Files', value: 10, color: '#9C27B0' }
    ],
    topContributors: [
      { id: 1, name: 'Alice Johnson', avatar: '', contributions: 34, role: 'Developer' },
      { id: 2, name: 'Bob Smith', avatar: '', contributions: 28, role: 'Designer' },
      { id: 3, name: 'Carol Davis', avatar: '', contributions: 22, role: 'Manager' },
      { id: 4, name: 'David Wilson', avatar: '', contributions: 19, role: 'Developer' }
    ],
    meetingStats: {
      averageDuration: 42,
      onTimeRate: 89,
      participationRate: 94,
      satisfactionScore: 4.3
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [selectedTeam, dateRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Try to load real analytics data
      const data = await apiService.getTeamAnalytics(selectedTeam, dateRange)
      setAnalytics(data)
    } catch (error) {
      // Use mock data for development
      console.log('Using mock analytics data')
      setAnalytics(mockAnalytics)
    } finally {
      setLoading(false)
    }
  }

  const MetricCard = ({ title, value, change, icon, color = 'primary' }) => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" fontWeight={600} color={color + '.main'}>
              {value}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              {change > 0 ? (
                <TrendingUp color="success" fontSize="small" />
              ) : (
                <TrendingDown color="error" fontSize="small" />
              )}
              <Typography
                variant="caption"
                color={change > 0 ? 'success.main' : 'error.main'}
                fontWeight={600}
              >
                {Math.abs(change)}% vs last period
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: color + '.100',
              color: color + '.main'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading analytics...
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
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Track team performance and collaboration metrics
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Team</InputLabel>
            <Select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              label="Team"
            >
              <MenuItem value="all">All Teams</MenuItem>
              <MenuItem value="dev">Development</MenuItem>
              <MenuItem value="design">Design</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Period"
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 3 months</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Overview Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Documents"
            value={analytics.overview.totalDocuments}
            change={analytics.overview.documentsChange}
            icon={<Description />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Meetings Held"
            value={analytics.overview.totalMeetings}
            change={analytics.overview.meetingsChange}
            icon={<VideoCall />}
            color="secondary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Users"
            value={analytics.overview.activeUsers}
            change={analytics.overview.usersChange}
            icon={<People />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Productivity Score"
            value={analytics.overview.productivity + '%'}
            change={analytics.overview.productivityChange}
            icon={<AnalyticsIcon />}
            color="warning"
          />
        </Grid>

        {/* Activity Chart */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Weekly Activity Overview
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={analytics.activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="documents" 
                  stroke="#2196F3" 
                  strokeWidth={2}
                  name="Documents"
                />
                <Line 
                  type="monotone" 
                  dataKey="meetings" 
                  stroke="#4CAF50" 
                  strokeWidth={2}
                  name="Meetings"
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#FF9800" 
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Document Types Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Document Types
            </Typography>
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={analytics.documentTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.documentTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Contributors */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Top Contributors
            </Typography>
            <List>
              {analytics.topContributors.map((contributor, index) => (
                <React.Fragment key={contributor.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar src={contributor.avatar}>
                        {contributor.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={contributor.name}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="caption" color="textSecondary">
                            {contributor.role}
                          </Typography>
                          <Chip 
                            label={`${contributor.contributions} contributions`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < analytics.topContributors.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Meeting Statistics */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Meeting Statistics
            </Typography>
            <Box display="flex" flexDirection="column" gap={3}>
              <Box display="flex" justifyContent="between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Timer color="primary" />
                  <Typography variant="body2">Average Duration</Typography>
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {analytics.meetingStats.averageDuration} min
                </Typography>
              </Box>

              <Box display="flex" justifyContent="between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Schedule color="success" />
                  <Typography variant="body2">On-time Rate</Typography>
                </Box>
                <Typography variant="h6" fontWeight={600} color="success.main">
                  {analytics.meetingStats.onTimeRate}%
                </Typography>
              </Box>

              <Box display="flex" justifyContent="between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <People color="warning" />
                  <Typography variant="body2">Participation Rate</Typography>
                </Box>
                <Typography variant="h6" fontWeight={600} color="warning.main">
                  {analytics.meetingStats.participationRate}%
                </Typography>
              </Box>

              <Box display="flex" justifyContent="between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle color="secondary" />
                  <Typography variant="body2">Satisfaction Score</Typography>
                </Box>
                <Typography variant="h6" fontWeight={600} color="secondary.main">
                  {analytics.meetingStats.satisfactionScore}/5.0
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Analytics
