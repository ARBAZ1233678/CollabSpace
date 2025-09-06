import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box,
  IconButton,
  Avatar,
  Typography,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Grid,
  Chip,
  Fade
} from '@mui/material'
import {
  CallEnd,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  PictureInPicture,
  Flip,
  MoreVert,
  Add,
  Remove
} from '@mui/icons-material'
import { useSocket } from '@services/socketService'
import { WEBRTC_CONFIG } from '@utils/constants'
import toast from 'react-hot-toast'

const VideoCall = ({
  participants = [],
  currentUser,
  onEndCall,
  onToggleMedia,
  roomId,
  isIncoming = false,
  callerInfo = null,
  autoAnswer = false
}) => {
  // Media state
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState({})
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [cameraFacing, setCameraFacing] = useState('user') // 'user' or 'environment'

  // Call state
  const [callState, setCallState] = useState(isIncoming ? 'incoming' : 'connecting') // 'connecting', 'connected', 'incoming', 'ended'
  const [callDuration, setCallDuration] = useState(0)
  const [connectionQuality, setConnectionQuality] = useState('good') // 'poor', 'fair', 'good', 'excellent'
  const [isMinimized, setIsMinimized] = useState(false)
  const [layout, setLayout] = useState('grid') // 'grid', 'speaker', 'pip'

  // UI state
  const [controlsVisible, setControlsVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showIncomingCall, setShowIncomingCall] = useState(isIncoming)

  // Refs
  const localVideoRef = useRef(null)
  const remoteVideoRefs = useRef({})
  const peerConnections = useRef({})
  const callStartTime = useRef(null)
  const controlsTimeoutRef = useRef(null)
  const statsInterval = useRef(null)

  const { 
    sendWebRTCOffer, 
    sendWebRTCAnswer, 
    sendICECandidate,
    addEventListener 
  } = useSocket()

  useEffect(() => {
    if (!isIncoming || autoAnswer) {
      initializeCall()
    }

    // Set up socket event listeners
    const removeOfferListener = addEventListener('webrtc:offer', handleReceiveOffer)
    const removeAnswerListener = addEventListener('webrtc:answer', handleReceiveAnswer) 
    const removeICEListener = addEventListener('webrtc:ice-candidate', handleReceiveICECandidate)

    return () => {
      cleanup()
      removeOfferListener()
      removeAnswerListener()
      removeICEListener()
    }
  }, [])

  useEffect(() => {
    if (callState === 'connected' && !callStartTime.current) {
      callStartTime.current = Date.now()
      startCallTimer()
      startConnectionMonitoring()
    }
  }, [callState])

  useEffect(() => {
    // Auto-hide controls after 3 seconds
    if (controlsVisible && callState === 'connected') {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false)
      }, 3000)
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [controlsVisible, callState])

  const initializeCall = async () => {
    try {
      setCallState('connecting')

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: WEBRTC_CONFIG.VIDEO_CONSTRAINTS,
        audio: WEBRTC_CONFIG.AUDIO_CONSTRAINTS
      })

      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Initialize peer connections for each participant
      participants.forEach(participant => {
        if (participant.id !== currentUser.id) {
          createPeerConnection(participant.id, stream)
        }
      })

      setCallState('connected')
      toast.success('Call connected')
    } catch (error) {
      console.error('Failed to initialize call:', error)
      toast.error('Failed to access camera/microphone')
      setCallState('ended')
    }
  }

  const createPeerConnection = async (participantId, localStream) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: WEBRTC_CONFIG.ICE_SERVERS
    })

    // Add local stream tracks
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream)
    })

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0]
      setRemoteStreams(prev => ({
        ...prev,
        [participantId]: remoteStream
      }))

      if (remoteVideoRefs.current[participantId]) {
        remoteVideoRefs.current[participantId].srcObject = remoteStream
      }
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendICECandidate(participantId, event.candidate, roomId)
      }
    }

    // Monitor connection state
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${participantId}:`, peerConnection.connectionState)

      if (peerConnection.connectionState === 'connected') {
        setCallState('connected')
      } else if (peerConnection.connectionState === 'failed') {
        toast.error(`Connection failed with participant`)
      }
    }

    peerConnections.current[participantId] = peerConnection

    // Create and send offer
    try {
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      sendWebRTCOffer(participantId, offer, roomId)
    } catch (error) {
      console.error('Failed to create offer:', error)
    }
  }

  const handleReceiveOffer = async ({ targetUserId, offer, meetingId }) => {
    if (meetingId !== roomId || targetUserId !== currentUser.id) return

    try {
      const peerConnection = peerConnections.current[targetUserId] || 
        new RTCPeerConnection({ iceServers: WEBRTC_CONFIG.ICE_SERVERS })

      await peerConnection.setRemoteDescription(offer)

      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      sendWebRTCAnswer(targetUserId, answer, roomId)
    } catch (error) {
      console.error('Failed to handle offer:', error)
    }
  }

  const handleReceiveAnswer = async ({ targetUserId, answer, meetingId }) => {
    if (meetingId !== roomId || targetUserId !== currentUser.id) return

    try {
      const peerConnection = peerConnections.current[targetUserId]
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer)
      }
    } catch (error) {
      console.error('Failed to handle answer:', error)
    }
  }

  const handleReceiveICECandidate = async ({ targetUserId, candidate, meetingId }) => {
    if (meetingId !== roomId || targetUserId !== currentUser.id) return

    try {
      const peerConnection = peerConnections.current[targetUserId]
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate)
      }
    } catch (error) {
      console.error('Failed to handle ICE candidate:', error)
    }
  }

  const handleToggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled
        setIsVideoEnabled(!isVideoEnabled)
        onToggleMedia?.('video', !isVideoEnabled)
      }
    }
  }

  const handleToggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled
        setIsAudioEnabled(!isAudioEnabled)
        onToggleMedia?.('audio', !isAudioEnabled)
      }
    }
  }

  const handleToggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })

        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0]
        Object.values(peerConnections.current).forEach(async (pc) => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video')
          if (sender) {
            await sender.replaceTrack(videoTrack)
          }
        })

        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }

        setIsScreenSharing(true)

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
      // Get camera back
      const stream = await navigator.mediaDevices.getUserMedia({
        video: WEBRTC_CONFIG.VIDEO_CONSTRAINTS
      })

      const videoTrack = stream.getVideoTracks()[0]
      Object.values(peerConnections.current).forEach(async (pc) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video')
        if (sender) {
          await sender.replaceTrack(videoTrack)
        }
      })

      // Update local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      setIsScreenSharing(false)
    } catch (error) {
      console.error('Failed to stop screen share:', error)
    }
  }

  const handleEndCall = () => {
    cleanup()
    onEndCall?.()
  }

  const handleAcceptCall = () => {
    setShowIncomingCall(false)
    initializeCall()
  }

  const handleDeclineCall = () => {
    setShowIncomingCall(false)
    onEndCall?.()
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

  const handleSwitchCamera = async () => {
    try {
      const newFacing = cameraFacing === 'user' ? 'environment' : 'user'

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { ...WEBRTC_CONFIG.VIDEO_CONSTRAINTS, facingMode: newFacing },
        audio: WEBRTC_CONFIG.AUDIO_CONSTRAINTS
      })

      // Stop current video track
      localStream?.getVideoTracks().forEach(track => track.stop())

      // Replace video track
      const videoTrack = stream.getVideoTracks()[0]
      Object.values(peerConnections.current).forEach(async (pc) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video')
        if (sender) {
          await sender.replaceTrack(videoTrack)
        }
      })

      // Update local stream and video
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      setCameraFacing(newFacing)
    } catch (error) {
      console.error('Failed to switch camera:', error)
      toast.error('Failed to switch camera')
    }
  }

  const cleanup = () => {
    // Stop all tracks
    localStream?.getTracks().forEach(track => track.stop())
    Object.values(remoteStreams).forEach(stream => {
      stream.getTracks().forEach(track => track.stop())
    })

    // Close peer connections
    Object.values(peerConnections.current).forEach(pc => pc.close())

    // Clear timers
    if (statsInterval.current) {
      clearInterval(statsInterval.current)
    }

    setCallState('ended')
  }

  const startCallTimer = () => {
    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }

  const startConnectionMonitoring = () => {
    statsInterval.current = setInterval(async () => {
      // Monitor connection quality
      const connections = Object.values(peerConnections.current)
      if (connections.length > 0) {
        try {
          const stats = await connections[0].getStats()
          // Analyze stats and update connection quality
          // This is a simplified example
          setConnectionQuality('good')
        } catch (error) {
          setConnectionQuality('poor')
        }
      }
    }, 5000)
  }

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'success'
      case 'good': return 'success'  
      case 'fair': return 'warning'
      case 'poor': return 'error'
      default: return 'default'
    }
  }

  // Incoming call dialog
  if (showIncomingCall) {
    return (
      <Dialog open={true} maxWidth="sm" fullWidth>
        <DialogTitle textAlign="center">Incoming Call</DialogTitle>
        <DialogContent>
          <Box textAlign="center" sx={{ py: 2 }}>
            <Avatar 
              sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
              src={callerInfo?.avatar}
            >
              {callerInfo?.name?.charAt(0)}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {callerInfo?.name || 'Unknown Caller'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Video call
            </Typography>
          </Box>

          <Box display="flex" justifyContent="center" gap={3} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeclineCall}
              sx={{ borderRadius: '50%', minWidth: 64, height: 64 }}
            >
              <CallEnd />
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleAcceptCall}
              sx={{ borderRadius: '50%', minWidth: 64, height: 64 }}
            >
              <Videocam />
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }

  // Call ended state
  if (callState === 'ended') {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
        textAlign="center"
      >
        <Typography variant="h6" gutterBottom>
          Call Ended
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Duration: {formatCallDuration(callDuration)}
        </Typography>
        <Button variant="contained" onClick={() => window.close()}>
          Close
        </Button>
      </Box>
    )
  }

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        bgcolor: '#000', 
        position: 'relative',
        cursor: controlsVisible ? 'default' : 'none'
      }}
      onClick={() => setControlsVisible(true)}
    >
      {/* Call Info Header */}
      <Fade in={controlsVisible}>
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
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">Video Call</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption">
                  {formatCallDuration(callDuration)}
                </Typography>
                <Chip 
                  label={connectionQuality}
                  size="small"
                  color={getConnectionQualityColor()}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
            </Box>

            <Box display="flex" gap={1}>
              <IconButton onClick={handleToggleFullscreen} sx={{ color: 'white' }}>
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
              <IconButton onClick={() => setIsMinimized(!isMinimized)} sx={{ color: 'white' }}>
                <PictureInPicture />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Video Grid */}
      <Grid container sx={{ height: '100%' }}>
        {/* Local Video */}
        <Grid item xs={12} md={participants.length > 0 ? 6 : 12}>
          <Box sx={{ height: '100%', position: 'relative' }}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: isScreenSharing ? 'none' : 'scaleX(-1)'
              }}
            />

            {/* Local video overlay */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Typography variant="caption">
                {currentUser.name} (You)
              </Typography>
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
                <Avatar sx={{ width: 120, height: 120 }}>
                  {currentUser.name?.charAt(0)}
                </Avatar>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Remote Videos */}
        {participants.map((participant) => (
          <Grid item xs={12} md={6} key={participant.id}>
            <Box sx={{ height: '100%', position: 'relative', bgcolor: 'grey.900' }}>
              <video
                ref={el => {
                  if (el) remoteVideoRefs.current[participant.id] = el
                }}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />

              {/* Remote video overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Typography variant="caption">
                  {participant.name}
                </Typography>
                {!participant.videoEnabled && <VideocamOff sx={{ fontSize: 16 }} />}
                {!participant.audioEnabled && <MicOff sx={{ fontSize: 16 }} />}
              </Box>

              {!participant.videoEnabled && (
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
                  <Avatar sx={{ width: 120, height: 120 }}>
                    {participant.name?.charAt(0)}
                  </Avatar>
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Call Controls */}
      <Fade in={controlsVisible}>
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
            gap: 2
          }}
        >
          <Tooltip title={isAudioEnabled ? 'Mute' : 'Unmute'}>
            <IconButton
              onClick={handleToggleAudio}
              sx={{
                bgcolor: isAudioEnabled ? 'rgba(255,255,255,0.2)' : 'error.main',
                color: 'white',
                width: 56,
                height: 56,
                '&:hover': {
                  bgcolor: isAudioEnabled ? 'rgba(255,255,255,0.3)' : 'error.dark'
                }
              }}
            >
              {isAudioEnabled ? <Mic /> : <MicOff />}
            </IconButton>
          </Tooltip>

          <Tooltip title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}>
            <IconButton
              onClick={handleToggleVideo}
              sx={{
                bgcolor: isVideoEnabled ? 'rgba(255,255,255,0.2)' : 'error.main',
                color: 'white',
                width: 56,
                height: 56
              }}
            >
              {isVideoEnabled ? <Videocam /> : <VideocamOff />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Switch camera">
            <IconButton
              onClick={handleSwitchCamera}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                width: 56,
                height: 56
              }}
            >
              <Flip />
            </IconButton>
          </Tooltip>

          <Tooltip title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
            <IconButton
              onClick={handleToggleScreenShare}
              sx={{
                bgcolor: isScreenSharing ? 'primary.main' : 'rgba(255,255,255,0.2)',
                color: 'white',
                width: 56,
                height: 56
              }}
            >
              {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
            </IconButton>
          </Tooltip>

          <Tooltip title="End call">
            <IconButton
              onClick={handleEndCall}
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                width: 56,
                height: 56,
                '&:hover': {
                  bgcolor: 'error.dark'
                }
              }}
            >
              <CallEnd />
            </IconButton>
          </Tooltip>
        </Box>
      </Fade>
    </Box>
  )
}

export default VideoCall
