import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Avatar,
  AvatarGroup,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  Badge,
  Tooltip,
  Drawer,
  Divider,
  Card,
  CardContent
} from '@mui/material'
import CallEnd from '@mui/icons-material/CallEnd';
import Mic from '@mui/icons-material/Mic';
import MicOff from '@mui/icons-material/MicOff';
import Videocam from '@mui/icons-material/Videocam';
import VideocamOff from '@mui/icons-material/VideocamOff';
import ScreenShare from '@mui/icons-material/ScreenShare';
import StopScreenShare from '@mui/icons-material/StopScreenShare';
import Chat from '@mui/icons-material/Chat';
import People from '@mui/icons-material/People';
import Settings from '@mui/icons-material/Settings';
import MoreVert from '@mui/icons-material/MoreVert';
import Send from '@mui/icons-material/Send';
import Fullscreen from '@mui/icons-material/Fullscreen';
import FullscreenExit from '@mui/icons-material/FullscreenExit';
import VolumeUp from '@mui/icons-material/VolumeUp';
import VolumeOff from '@mui/icons-material/VolumeOff';
import PictureInPicture from '@mui/icons-material/PictureInPicture';
import RecordVoiceOver from '@mui/icons-material/RecordVoiceOver';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import { useAuth } from '@hooks/useAuth'
import { useSocket } from '@services/socketService'
import { apiService } from '@services/api'
import Loading from '@components/common/Loading'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const MeetingRoom = () => {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { 
    joinMeeting, 
    leaveMeeting, 
    sendChatMessage,
    toggleMeetingMedia,
    connected 
  } = useSocket()

  // Meeting state
  const [meeting, setMeeting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState([])
  const [chatMessages, setChatMessages] = useState([])

  // Media state
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false)
  const [isHandRaised, setIsHandRaised] = useState(false)

  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [pinnedParticipant, setPinnedParticipant] = useState(null)

  // Refs
  const localVideoRef = useRef(null)
  const localStreamRef = useRef(null)
  const peerConnectionsRef = useRef({})
  const chatRef = useRef(null)

  useEffect(() => {
    initializeMeeting()

    return () => {
      cleanup()
    }
  }, [meetingId])

  useEffect(() => {
    if (meeting && connected) {
      joinMeeting(meetingId, meeting.meetingUrl)
    }
  }, [meeting, connected, meetingId, joinMeeting])

  const initializeMeeting = async () => {
    setLoading(true)
    try {
      const meetingData = await apiService.getMeeting(meetingId)
      setMeeting(meetingData)

      // Initialize media
      await initializeMedia()

      // Set up WebRTC
      await setupWebRTC()
    } catch (error) {
      console.error('Failed to initialize meeting:', error)
      toast.error('Failed to join meeting')
      navigate('/meetings')
    } finally {
      setLoading(false)
    }
  }

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      setIsVideoEnabled(true)
      setIsAudioEnabled(true)
    } catch (error) {
      console.error('Failed to access media devices:', error)
      toast.error('Could not access camera/microphone')
    }
  }

  const setupWebRTC = async () => {
    // WebRTC setup would go here
    // This is a simplified version - full implementation would include:
    // - ICE server configuration
    // - Peer connection management
    // - Signaling server communication
    console.log('Setting up WebRTC...')
  }

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }

    Object.values(peerConnectionsRef.current).forEach(pc => {
      pc.close()
    })

    if (meetingId) {
      leaveMeeting(meetingId)
    }
  }

  const handleToggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !isVideoEnabled
      setIsVideoEnabled(!isVideoEnabled)
      toggleMeetingMedia(meetingId, 'video', !isVideoEnabled)
      toast.info(isVideoEnabled ? 'Camera turned off' : 'Camera turned on')
    }
  }

  const handleToggleAudio = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !isAudioEnabled
      setIsAudioEnabled(!isAudioEnabled)
      toggleMeetingMedia(meetingId, 'audio', !isAudioEnabled)
      toast.info(isAudioEnabled ? 'Microphone muted' : 'Microphone unmuted')
    }
  }

  const handleToggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })

        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0]
        const sender = peerConnectionsRef.current[user.id]?.getSenders()
          .find(s => s.track && s.track.kind === 'video')

        if (sender) {
          await sender.replaceTrack(videoTrack)
        }

        setIsScreenSharing(true)
        toast.success('Screen sharing started')

        // Handle screen share end
        videoTrack.addEventListener('ended', () => {
          handleStopScreenShare()
        })
      } else {
        handleStopScreenShare()
      }
    } catch (error) {
      console.error('Screen share failed:', error)
      toast.error('Failed to share screen')
    }
  }

  const handleStopScreenShare = async () => {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true })
      const videoTrack = cameraStream.getVideoTracks()[0]

      const sender = peerConnectionsRef.current[user.id]?.getSenders()
        .find(s => s.track && s.track.kind === 'video')

      if (sender) {
        await sender.replaceTrack(videoTrack)
      }

      setIsScreenSharing(false)
      toast.info('Screen sharing stopped')
    } catch (error) {
      console.error('Failed to stop screen share:', error)
    }
  }

  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to leave the meeting?')) {
      cleanup()
      navigate('/meetings')
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      text: newMessage,
      author: user.name,
      authorId: user.id,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, message])
    sendChatMessage(meetingId, message)
    setNewMessage('')
  }

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleRaiseHand = () => {
    setIsHandRaised(!isHandRaised)
    toast.info(isHandRaised ? 'Hand lowered' : 'Hand raised')
  }

  if (loading) {
    return <Loading message="Joining meeting..." />
  }

  if (!meeting) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Meeting not found</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100vh', bgcolor: '#000', position: 'relative', overflow: 'hidden' }}>
      {/* Meeting Header */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          p: 2,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
          zIndex: 10,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">{meeting.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip 
                label={`${participants.length + 1} participants`} 
                size="small" 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Typography variant="caption">
                Started {formatDistanceToNow(new Date(meeting.startTime), { addSuffix: true })}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Meeting settings">
              <IconButton onClick={() => setShowSettings(true)} sx={{ color: 'white' }}>
                <Settings />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fullscreen">
              <IconButton onClick={handleToggleFullscreen} sx={{ color: 'white' }}>
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Video Grid */}
      <Box sx={{ height: '100%', p: 2, pt: 10, pb: 12 }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Main Video Area */}
          <Grid item xs={12} md={showChat || showParticipants ? 8 : 12}>
            <Box sx={{ height: '100%', position: 'relative' }}>
              {/* Local Video */}
              <Paper
                sx={{
                  height: pinnedParticipant ? '30%' : '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: 'grey.900'
                }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)' // Mirror local video
                  }}
                />

                {/* Local Video Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1
                  }}
                >
                  <Avatar sx={{ width: 24, height: 24 }}>
                    {user.name?.charAt(0)}
                  </Avatar>
                  <Typography variant="caption">
                    {user.name} (You)
                  </Typography>
                  {isHandRaised && <PanToolAltIcon sx={{ fontSize: 16, color: 'yellow' }} />}
                  {!isVideoEnabled && <VideocamOff sx={{ fontSize: 16 }} />}
                  {!isAudioEnabled && <MicOff sx={{ fontSize: 16 }} />}
                </Box>

                {!isVideoEnabled && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.8)'
                    }}
                  >
                    <Avatar sx={{ width: 80, height: 80 }}>
                      {user.name?.charAt(0)}
                    </Avatar>
                  </Box>
                )}
              </Paper>

              {/* Participants Grid */}
              {participants.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: pinnedParticipant ? '70%' : 0,
                    right: 0,
                    width: pinnedParticipant ? '100%' : '30%',
                    height: pinnedParticipant ? '30%' : '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 1,
                    p: 1
                  }}
                >
                  {participants.map((participant) => (
                    <Paper
                      key={participant.id}
                      sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        bgcolor: 'grey.800',
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 4 }
                      }}
                      onClick={() => setPinnedParticipant(
                        pinnedParticipant === participant.id ? null : participant.id
                      )}
                    >
                      {/* Participant video would go here */}
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 100
                        }}
                      >
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {participant.name?.charAt(0)}
                        </Avatar>
                      </Box>

                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 4,
                          left: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Typography variant="caption" noWrap>
                          {participant.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {participant.isHandRaised && <PanToolAltIcon sx={{ fontSize: 12, color: 'yellow' }} />}
                          {!participant.videoEnabled && <VideocamOff sx={{ fontSize: 12 }} />}
                          {!participant.audioEnabled && <MicOff sx={{ fontSize: 12 }} />}
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Sidebar */}
          {(showChat || showParticipants) && (
            <Grid item xs={12} md={4}>
              {showChat && <ChatPanel />}
              {showParticipants && <ParticipantsPanel />}
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Meeting Controls */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
          display: 'flex',
          justifyContent: 'center',
          gap: 1
        }}
      >
        {/* Audio Control */}
        <Tooltip title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}>
          <IconButton
            onClick={handleToggleAudio}
            sx={{
              bgcolor: isAudioEnabled ? 'rgba(255,255,255,0.2)' : 'error.main',
              color: 'white',
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: isAudioEnabled ? 'rgba(255,255,255,0.3)' : 'error.dark'
              }
            }}
          >
            {isAudioEnabled ? <Mic /> : <MicOff />}
          </IconButton>
        </Tooltip>

        {/* Video Control */}
        <Tooltip title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}>
          <IconButton
            onClick={handleToggleVideo}
            sx={{
              bgcolor: isVideoEnabled ? 'rgba(255,255,255,0.2)' : 'error.main',
              color: 'white',
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: isVideoEnabled ? 'rgba(255,255,255,0.3)' : 'error.dark'
              }
            }}
          >
            {isVideoEnabled ? <Videocam /> : <VideocamOff />}
          </IconButton>
        </Tooltip>

        {/* Screen Share Control */}
        <Tooltip title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
          <IconButton
            onClick={handleToggleScreenShare}
            sx={{
              bgcolor: isScreenSharing ? 'primary.main' : 'rgba(255,255,255,0.2)',
              color: 'white',
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: isScreenSharing ? 'primary.dark' : 'rgba(255,255,255,0.3)'
              }
            }}
          >
            {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 1 }} />

        {/* Raise Hand */}
        <Tooltip title={isHandRaised ? 'Lower hand' : 'Raise hand'}>
          <IconButton
            onClick={handleRaiseHand}
            sx={{
              bgcolor: isHandRaised ? 'warning.main' : 'rgba(255,255,255,0.2)',
              color: 'white',
              width: 48,
              height: 48
            }}
          >
            <PanToolAltIcon />
          </IconButton>
        </Tooltip>

        {/* Chat Toggle */}
        <Tooltip title="Toggle chat">
          <IconButton
            onClick={() => setShowChat(!showChat)}
            sx={{
              bgcolor: showChat ? 'primary.main' : 'rgba(255,255,255,0.2)',
              color: 'white',
              width: 48,
              height: 48
            }}
          >
            <Badge badgeContent={chatMessages.length} color="error">
              <Chat />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Participants Toggle */}
        <Tooltip title="Show participants">
          <IconButton
            onClick={() => setShowParticipants(!showParticipants)}
            sx={{
              bgcolor: showParticipants ? 'primary.main' : 'rgba(255,255,255,0.2)',
              color: 'white',
              width: 48,
              height: 48
            }}
          >
            <People />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 1 }} />

        {/* End Call */}
        <Tooltip title="Leave meeting">
          <Button
            onClick={handleEndCall}
            variant="contained"
            color="error"
            startIcon={<CallEnd />}
            sx={{ 
              minWidth: 120,
              height: 48,
              fontWeight: 600
            }}
          >
            Leave
          </Button>
        </Tooltip>
      </Box>

      {/* Chat Component */}
      <ChatPanel />

      {/* Participants Component */}
      <ParticipantsPanel />
    </Box>
  )

  // Chat Panel Component
  function ChatPanel() {
    return (
      <Drawer
        anchor="right"
        open={showChat}
        onClose={() => setShowChat(false)}
        variant="persistent"
        sx={{
          '& .MuiDrawer-paper': {
            width: 320,
            mt: 8,
            height: 'calc(100vh - 64px)',
            bgcolor: 'background.paper'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Chat</Typography>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
          {chatMessages.map((message) => (
            <Box key={message.id} sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary">
                {message.author} • {formatDistanceToNow(message.timestamp, { addSuffix: true })}
              </Typography>
              <Typography variant="body2">
                {message.text}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <IconButton onClick={handleSendMessage} color="primary">
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    )
  }

  // Participants Panel Component
  function ParticipantsPanel() {
    return (
      <Dialog 
        open={showParticipants} 
        onClose={() => setShowParticipants(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Participants ({participants.length + 1})
        </DialogTitle>
        <DialogContent>
          <List>
            {/* Current User */}
            <ListItem>
              <ListItemAvatar>
                <Badge
                  color="success"
                  variant="dot"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                  <Avatar>{user.name?.charAt(0)}</Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={`${user.name} (You)`}
                secondary="Host"
              />
            </ListItem>

            {/* Other Participants */}
            {participants.map((participant) => (
              <ListItem key={participant.id}>
                <ListItemAvatar>
                  <Badge
                    color={participant.isOnline ? 'success' : 'default'}
                    variant="dot"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <Avatar>{participant.name?.charAt(0)}</Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={participant.name}
                  secondary={participant.role || 'Participant'}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    )
  }
}

export default MeetingRoom
