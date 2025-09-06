import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  AvatarGroup,
  Chip,
  Menu,
  MenuItem,
  Divider,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material'
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Link,
  Image,
  Code,
  Undo,
  Redo,
  Comment,
  Share,
  Save,
  History
} from '@mui/icons-material'
import { useSocket } from '@services/socketService'
import { useAuth } from '@hooks/useAuth'
import { debounce } from 'lodash'
import toast from 'react-hot-toast'

const CollaborativeEditor = ({ 
  documentId, 
  initialContent = '', 
  readOnly = false,
  onContentChange,
  onSave 
}) => {
  const { user } = useAuth()
  const { 
    joinDocument, 
    leaveDocument, 
    sendDocumentOperation, 
    updateCursor,
    startTyping,
    stopTyping,
    connected 
  } = useSocket()

  const [content, setContent] = useState(initialContent)
  const [collaborators, setCollaborators] = useState([])
  const [cursors, setCursors] = useState({})
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [comments, setComments] = useState([])
  const [selectedText, setSelectedText] = useState('')
  const [commentAnchor, setCommentAnchor] = useState(null)
  const [isCommentMenuOpen, setIsCommentMenuOpen] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [version, setVersion] = useState(1)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  const editorRef = useRef(null)
  const selectionRef = useRef({ start: 0, end: 0 })
  const isTypingRef = useRef(false)

  // Join document collaboration when component mounts
  useEffect(() => {
    if (documentId && connected) {
      joinDocument(documentId, 1) // teamId would come from props/context

      return () => {
        leaveDocument(documentId)
      }
    }
  }, [documentId, connected, joinDocument, leaveDocument])

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce(async (content) => {
      if (!readOnly && onSave) {
        setSaving(true)
        try {
          await onSave(content)
          setLastSaved(new Date())
          toast.success('Document saved')
        } catch (error) {
          toast.error('Failed to save document')
        } finally {
          setSaving(false)
        }
      }
    }, 2000),
    [onSave, readOnly]
  )

  // Debounced typing indicator
  const debouncedStopTyping = useCallback(
    debounce(() => {
      if (isTypingRef.current) {
        stopTyping(documentId)
        isTypingRef.current = false
      }
    }, 1000),
    [documentId, stopTyping]
  )

  const handleContentChange = (event) => {
    if (readOnly) return

    const newContent = event.target.value
    const cursorPos = event.target.selectionStart

    // Update local state
    setContent(newContent)

    // Send operation to other collaborators
    const operation = {
      type: 'insert',
      position: cursorPos,
      content: newContent,
      user: user.id,
      timestamp: Date.now()
    }

    sendDocumentOperation(documentId, operation, version + 1)
    setVersion(prev => prev + 1)

    // Update cursor position
    updateCursor(documentId, { position: cursorPos, user: user.id })

    // Handle typing indicators
    if (!isTypingRef.current) {
      startTyping(documentId)
      isTypingRef.current = true
    }
    debouncedStopTyping()

    // Auto-save
    debouncedSave(newContent)

    // Notify parent component
    if (onContentChange) {
      onContentChange(newContent)
    }
  }

  const handleSelectionChange = () => {
    if (!editorRef.current) return

    const start = editorRef.current.selectionStart
    const end = editorRef.current.selectionEnd

    selectionRef.current = { start, end }

    if (start !== end) {
      const selected = content.substring(start, end)
      setSelectedText(selected)
    } else {
      setSelectedText('')
    }

    // Update cursor position for collaborators
    updateCursor(documentId, { 
      position: start, 
      selection: start !== end ? { start, end } : null,
      user: user.id 
    })
  }

  const applyFormatting = (format) => {
    if (readOnly || !editorRef.current) return

    const start = selectionRef.current.start
    const end = selectionRef.current.end

    if (start === end) return // No selection

    const selectedText = content.substring(start, end)
    let formattedText = selectedText

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        break
      case 'underline':
        formattedText = `<u>${selectedText}</u>`
        break
      case 'code':
        formattedText = `\`${selectedText}\``
        break
      default:
        return
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end)
    setContent(newContent)

    // Send operation to collaborators
    const operation = {
      type: 'format',
      position: start,
      length: end - start,
      format: format,
      user: user.id,
      timestamp: Date.now()
    }

    sendDocumentOperation(documentId, operation, version + 1)
    setVersion(prev => prev + 1)
  }

  const handleAddComment = () => {
    if (!selectedText) return

    const newCommentObj = {
      id: Date.now(),
      text: newComment,
      author: user.name,
      authorId: user.id,
      selectedText: selectedText,
      position: selectionRef.current,
      timestamp: new Date(),
      resolved: false
    }

    setComments(prev => [...prev, newCommentObj])
    setNewComment('')
    setIsCommentMenuOpen(false)
    toast.success('Comment added')
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 1, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          borderRadius: 0,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        {/* Formatting Tools */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Bold">
            <IconButton 
              size="small" 
              onClick={() => applyFormatting('bold')}
              disabled={readOnly || !selectedText}
            >
              <FormatBold />
            </IconButton>
          </Tooltip>

          <Tooltip title="Italic">
            <IconButton 
              size="small" 
              onClick={() => applyFormatting('italic')}
              disabled={readOnly || !selectedText}
            >
              <FormatItalic />
            </IconButton>
          </Tooltip>

          <Tooltip title="Underline">
            <IconButton 
              size="small" 
              onClick={() => applyFormatting('underline')}
              disabled={readOnly || !selectedText}
            >
              <FormatUnderlined />
            </IconButton>
          </Tooltip>

          <Tooltip title="Code">
            <IconButton 
              size="small" 
              onClick={() => applyFormatting('code')}
              disabled={readOnly || !selectedText}
            >
              <Code />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Add Comment">
            <IconButton 
              size="small"
              onClick={() => setIsCommentMenuOpen(true)}
              disabled={!selectedText}
            >
              <Comment />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share">
            <IconButton size="small">
              <Share />
            </IconButton>
          </Tooltip>

          <Tooltip title="Version History">
            <IconButton size="small">
              <History />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Status */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
          {saving && (
            <Chip 
              label="Saving..." 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          )}

          {lastSaved && (
            <Typography variant="caption" color="textSecondary">
              Last saved: {formatTimestamp(lastSaved)}
            </Typography>
          )}

          {/* Collaborators */}
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
            {collaborators.map((collaborator) => (
              <Tooltip key={collaborator.id} title={collaborator.name}>
                <Avatar src={collaborator.avatar}>
                  {collaborator.name.charAt(0)}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
        </Box>
      </Paper>

      {/* Typing Indicators */}
      {typingUsers.size > 0 && (
        <Box sx={{ px: 2, py: 0.5, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="textSecondary">
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </Typography>
        </Box>
      )}

      {/* Editor */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          onSelect={handleSelectionChange}
          onMouseUp={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          placeholder="Start writing your document..."
          readOnly={readOnly}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            padding: '24px',
            fontFamily: '"Inter", "Roboto", sans-serif',
            fontSize: '16px',
            lineHeight: 1.6,
            backgroundColor: 'transparent'
          }}
        />

        {/* Cursor overlays would be rendered here in a more advanced implementation */}
      </Box>

      {/* Comments Panel */}
      {comments.length > 0 && (
        <Paper 
          elevation={2} 
          sx={{ 
            position: 'absolute', 
            right: 0, 
            top: 64, 
            width: 300, 
            maxHeight: '70%', 
            overflow: 'auto',
            zIndex: 1000
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600}>
              Comments ({comments.length})
            </Typography>
          </Box>

          <List dense>
            {comments.map((comment, index) => (
              <ListItem key={comment.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {comment.author.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {comment.author}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        on "{comment.selectedText}"
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2">
                        {comment.text}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {comment.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Comment Dialog */}
      <Menu
        open={isCommentMenuOpen}
        onClose={() => setIsCommentMenuOpen(false)}
        anchorReference="anchorPosition"
        anchorPosition={{ top: 200, left: 400 }}
        PaperProps={{ sx: { width: 300, p: 2 } }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Add comment on: "{selectedText}"
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment..."
          sx={{ mb: 2 }}
        />
        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button 
            size="small" 
            onClick={() => setIsCommentMenuOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            size="small" 
            variant="contained" 
            onClick={handleAddComment}
            disabled={!newComment.trim()}
          >
            Add Comment
          </Button>
        </Box>
      </Menu>
    </Box>
  )
}

export default CollaborativeEditor
