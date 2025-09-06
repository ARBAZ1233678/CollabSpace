import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Chip,
  Avatar,
  AvatarGroup,
  Tooltip,
  CircularProgress,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material'
import {
  ArrowBack,
  Share,
  Download,
  MoreVert,
  Save,
  History,
  Comment,
  Print,
  CloudUpload,
  PictureAsPdf,
  Description,
  Sync,
  Lock,
  LockOpen,
  Visibility,
  Edit
} from '@mui/icons-material'
import { useAuth } from '@hooks/useAuth'
import { useDocument } from '@hooks/useDocument'
import { useSocket } from '@services/socketService'
import CollaborativeEditor from '@components/document/CollaborativeEditor'
import Loading from '@components/common/Loading'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const DocumentEditor = () => {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { connected } = useSocket()

  const {
    document,
    content,
    loading,
    saving,
    error,
    lastSaved,
    hasUnsavedChanges,
    collaborators,
    isLocked,
    lockedBy,
    canEdit,
    updateContent,
    saveDocument,
    lockDocument,
    unlockDocument
  } = useDocument(documentId, {
    autoSave: true,
    autoSaveDelay: 2000,
    onSave: () => toast.success('Document saved'),
    onError: (err) => toast.error(err.message)
  })

  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null)
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState('view')
  const [versions, setVersions] = useState([])
  const [viewMode, setViewMode] = useState('edit') // 'edit' or 'view'

  useEffect(() => {
    if (error) {
      toast.error(error)
      // Redirect to documents list if document not found
      if (error.includes('not found')) {
        navigate('/documents')
      }
    }
  }, [error, navigate])

  const handleSave = async () => {
    try {
      await saveDocument()
    } catch (err) {
      toast.error('Failed to save document')
    }
  }

  const handleShare = async () => {
    if (!shareEmail) {
      toast.error('Please enter an email address')
      return
    }

    try {
      // API call to share document would go here
      toast.success(`Document shared with ${shareEmail}`)
      setShareDialogOpen(false)
      setShareEmail('')
    } catch (err) {
      toast.error('Failed to share document')
    }
  }

  const handleExport = (format) => {
    setExportMenuAnchor(null)

    switch (format) {
      case 'pdf':
        toast.info('Exporting to PDF...')
        // PDF export logic would go here
        break
      case 'docx':
        toast.info('Exporting to Word...')
        // DOCX export logic would go here
        break
      case 'md':
        const blob = new Blob([content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${document?.title || 'document'}.md`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Downloaded as Markdown')
        break
      case 'google-docs':
        toast.info('Exporting to Google Docs...')
        // Google Docs export logic would go here
        break
      default:
        toast.error('Export format not supported')
    }
  }

  const handleToggleLock = async () => {
    try {
      if (isLocked && canEdit) {
        await unlockDocument()
      } else if (!isLocked) {
        await lockDocument()
      }
    } catch (err) {
      toast.error('Failed to change document lock status')
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${document?.title || 'Document'}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
            h1 { color: #333; margin-bottom: 10px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <h1>${document?.title || 'Document'}</h1>
          <div class="meta">
            Last modified: ${document?.updatedAt ? formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true }) : 'Unknown'}
          </div>
          <div>${content.replace(/\n/g, '<br>')}</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  const getConnectionStatus = () => {
    if (!connected) return { text: 'Offline', color: 'error' }
    if (saving) return { text: 'Saving...', color: 'warning' }
    if (hasUnsavedChanges) return { text: 'Unsaved changes', color: 'warning' }
    if (lastSaved) return { text: `Saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}`, color: 'success' }
    return { text: 'All changes saved', color: 'success' }
  }

  const connectionStatus = getConnectionStatus()

  if (loading) {
    return <Loading message="Loading document..." />
  }

  if (!document) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Document not found</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Document Header */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          borderRadius: 0,
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: 10
        }}
      >
        {/* Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <IconButton onClick={() => navigate('/documents')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Breadcrumbs>
            <Link 
              color="inherit" 
              onClick={() => navigate('/documents')}
              sx={{ cursor: 'pointer' }}
            >
              Documents
            </Link>
            <Typography color="textPrimary">
              {document.title}
            </Typography>
          </Breadcrumbs>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Document Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
          {/* Connection Status */}
          <Chip 
            label={connectionStatus.text}
            color={connectionStatus.color}
            size="small"
            variant="outlined"
            icon={saving ? <CircularProgress size={16} /> : undefined}
          />

          {/* Document Type */}
          <Chip 
            label={document.type}
            size="small"
            color="primary"
            variant="outlined"
          />

          {/* Lock Status */}
          {isLocked && (
            <Chip
              label={lockedBy === user.id ? 'Locked by you' : `Locked by ${lockedBy}`}
              icon={<Lock />}
              size="small"
              color="warning"
              variant="outlined"
            />
          )}

          {/* View Mode Toggle */}
          <Button
            size="small"
            variant="outlined"
            startIcon={viewMode === 'edit' ? <Visibility /> : <Edit />}
            onClick={() => setViewMode(viewMode === 'edit' ? 'view' : 'edit')}
          >
            {viewMode === 'edit' ? 'Preview' : 'Edit'}
          </Button>
        </Box>

        {/* Collaborators */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
            {collaborators.map((collaborator) => (
              <Tooltip key={collaborator.userId} title={`${collaborator.userName} (${collaborator.role})`}>
                <Avatar src={collaborator.avatar}>
                  {collaborator.userName.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
          {collaborators.length > 0 && (
            <Typography variant="caption" color="textSecondary">
              {collaborators.length} online
            </Typography>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canEdit && (
            <Tooltip title={isLocked ? 'Unlock document' : 'Lock document'}>
              <IconButton onClick={handleToggleLock}>
                {isLocked ? <LockOpen /> : <Lock />}
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Save document">
            <IconButton 
              onClick={handleSave}
              disabled={!hasUnsavedChanges || saving}
            >
              <Save />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share document">
            <IconButton onClick={() => setShareDialogOpen(true)}>
              <Share />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export document">
            <IconButton onClick={(e) => setExportMenuAnchor(e.currentTarget)}>
              <Download />
            </IconButton>
          </Tooltip>

          <Tooltip title="Print document">
            <IconButton onClick={handlePrint}>
              <Print />
            </IconButton>
          </Tooltip>

          <Tooltip title="Version history">
            <IconButton onClick={() => setHistoryDialogOpen(true)}>
              <History />
            </IconButton>
          </Tooltip>

          <IconButton>
            <MoreVert />
          </IconButton>
        </Box>
      </Paper>

      {/* Editor */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {viewMode === 'edit' ? (
          <CollaborativeEditor
            documentId={documentId}
            initialContent={content}
            readOnly={!canEdit}
            onContentChange={updateContent}
            onSave={saveDocument}
          />
        ) : (
          <Box sx={{ p: 4, height: '100%', overflow: 'auto' }}>
            <Paper sx={{ p: 4, minHeight: '100%', backgroundColor: 'white' }}>
              <Typography variant="h4" gutterBottom>
                {document.title}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {content || 'This document is empty...'}
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Document</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            select
            label="Permission"
            value={sharePermission}
            onChange={(e) => setSharePermission(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="view">Can view</option>
            <option value="comment">Can comment</option>
            <option value="edit">Can edit</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleShare} variant="contained">Share</Button>
        </DialogActions>
      </Dialog>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleExport('pdf')}>
          <PictureAsPdf sx={{ mr: 1 }} />
          Export as PDF
        </MenuItem>
        <MenuItem onClick={() => handleExport('docx')}>
          <Description sx={{ mr: 1 }} />
          Export as Word Document
        </MenuItem>
        <MenuItem onClick={() => handleExport('md')}>
          <CloudUpload sx={{ mr: 1 }} />
          Download as Markdown
        </MenuItem>
        <MenuItem onClick={() => handleExport('google-docs')}>
          <Sync sx={{ mr: 1 }} />
          Export to Google Docs
        </MenuItem>
      </Menu>

      {/* Version History Dialog */}
      <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Version History</DialogTitle>
        <DialogContent>
          <List>
            {versions.map((version) => (
              <ListItem key={version.id}>
                <ListItemAvatar>
                  <Avatar>{version.authorName?.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`Version ${version.number}`}
                  secondary={`${version.authorName} • ${formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}`}
                />
                <Button size="small">Restore</Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DocumentEditor
