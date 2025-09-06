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
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material'
import {
  Add,
  Search,
  MoreVert,
  Description,
  Share,
  Download,
  Delete,
  Edit,
  Folder,
  Article,
  Code,
  TableChart,
  Slideshow,
  FilterList,
  Sort,
  ViewList,
  ViewModule
} from '@mui/icons-material'
import { useAuth } from '@hooks/useAuth'
import { apiService } from '@services/api'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const DocumentList = ({ teamId }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('updated')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newDocumentTitle, setNewDocumentTitle] = useState('')
  const [newDocumentType, setNewDocumentType] = useState('DOCUMENT')

  useEffect(() => {
    loadDocuments()
  }, [teamId])

  useEffect(() => {
    filterAndSortDocuments()
  }, [documents, searchQuery, filterType, sortBy])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const docs = await apiService.getTeamDocuments(teamId || 1)
      setDocuments(Array.isArray(docs) ? docs : docs.documents || [])
    } catch (error) {
      console.error('Failed to load documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortDocuments = () => {
    let filtered = documents

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.content && doc.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'updated':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt)
      }
    })

    setFilteredDocuments(filtered)
  }

  const handleDocumentMenuOpen = (event, document) => {
    event.stopPropagation()
    setSelectedDocument(document)
    setAnchorEl(event.currentTarget)
  }

  const handleDocumentMenuClose = () => {
    setSelectedDocument(null)
    setAnchorEl(null)
  }

  const handleCreateDocument = async () => {
    if (!newDocumentTitle.trim()) {
      toast.error('Document title is required')
      return
    }

    try {
      const newDoc = await apiService.createDocument({
        title: newDocumentTitle,
        type: newDocumentType,
        teamId: teamId || 1,
        content: ''
      })

      setDocuments(prev => [newDoc, ...prev])
      setCreateDialogOpen(false)
      setNewDocumentTitle('')
      setNewDocumentType('DOCUMENT')
      toast.success('Document created successfully')

      // Navigate to the new document
      navigate(`/document/${newDoc.id}`)
    } catch (error) {
      console.error('Failed to create document:', error)
      toast.error('Failed to create document')
    }
  }

  const handleDeleteDocument = async (document) => {
    if (window.confirm(`Are you sure you want to delete "${document.title}"?`)) {
      try {
        await apiService.deleteDocument(document.id)
        setDocuments(prev => prev.filter(doc => doc.id !== document.id))
        toast.success('Document deleted successfully')
      } catch (error) {
        console.error('Failed to delete document:', error)
        toast.error('Failed to delete document')
      }
    }
    handleDocumentMenuClose()
  }

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'DOCUMENT': return <Article />
      case 'SPREADSHEET': return <TableChart />
      case 'PRESENTATION': return <Slideshow />
      case 'CODE': return <Code />
      case 'MARKDOWN': return <Description />
      default: return <Description />
    }
  }

  const getDocumentTypeColor = (type) => {
    switch (type) {
      case 'DOCUMENT': return 'primary'
      case 'SPREADSHEET': return 'success'
      case 'PRESENTATION': return 'warning'
      case 'CODE': return 'secondary'
      case 'MARKDOWN': return 'info'
      default: return 'default'
    }
  }

  const DocumentCard = ({ document }) => (
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
      onClick={() => navigate(`/document/${document.id}`)}
    >
      <CardContent>
        <Box display="flex" justifyContent="between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            {getDocumentIcon(document.type)}
            <Chip 
              label={document.type}
              color={getDocumentTypeColor(document.type)}
              size="small"
            />
          </Box>
          <IconButton 
            size="small"
            onClick={(e) => handleDocumentMenuOpen(e, document)}
          >
            <MoreVert />
          </IconButton>
        </Box>

        <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
          {document.title}
        </Typography>

        <Typography 
          variant="body2" 
          color="textSecondary" 
          sx={{ 
            height: 40, 
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {document.content || 'No content yet...'}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mt={2}>
          <Avatar sx={{ width: 24, height: 24 }}>
            {document.lastModifiedByName?.charAt(0) || document.createdByName?.charAt(0) || 'U'}
          </Avatar>
          <Typography variant="caption" color="textSecondary">
            {document.lastModifiedByName || document.createdByName || 'Unknown'}
          </Typography>
        </Box>

        <Typography variant="caption" color="textSecondary" display="block" mt={1}>
          Updated {formatDistanceToNow(new Date(document.updatedAt))} ago
        </Typography>
      </CardContent>
    </Card>
  )

  const DocumentListItem = ({ document }) => (
    <ListItem
      button
      onClick={() => navigate(`/document/${document.id}`)}
      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
    >
      <ListItemIcon>
        {getDocumentIcon(document.type)}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body1" fontWeight={600}>
              {document.title}
            </Typography>
            <Chip 
              label={document.type}
              color={getDocumentTypeColor(document.type)}
              size="small"
            />
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="textSecondary">
              By {document.lastModifiedByName || document.createdByName || 'Unknown'} • 
              Updated {formatDistanceToNow(new Date(document.updatedAt))} ago
            </Typography>
          </Box>
        }
      />
      <ListItemSecondaryAction>
        <IconButton onClick={(e) => handleDocumentMenuOpen(e, document)}>
          <MoreVert />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Documents
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Collaborate on documents with your team
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <IconButton onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <ViewList /> : <ViewModule />}
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            New Document
          </Button>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search documents..."
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

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="DOCUMENT">Documents</MenuItem>
                <MenuItem value="SPREADSHEET">Spreadsheets</MenuItem>
                <MenuItem value="PRESENTATION">Presentations</MenuItem>
                <MenuItem value="CODE">Code Files</MenuItem>
                <MenuItem value="MARKDOWN">Markdown</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort by"
              >
                <MenuItem value="updated">Last Updated</MenuItem>
                <MenuItem value="created">Date Created</MenuItem>
                <MenuItem value="title">Title</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="textSecondary" textAlign="center">
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Documents */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <Typography>Loading documents...</Typography>
        </Box>
      ) : filteredDocuments.length === 0 ? (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
          <Folder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {documents.length === 0 ? 'No documents yet' : 'No documents match your search'}
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            {documents.length === 0 ? 'Create your first document to get started' : 'Try adjusting your search or filters'}
          </Typography>
          {documents.length === 0 && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Document
            </Button>
          )}
        </Paper>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {filteredDocuments.map((document) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={document.id}>
                  <DocumentCard document={document} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <List>
              {filteredDocuments.map((document) => (
                <DocumentListItem key={document.id} document={document} />
              ))}
            </List>
          )}
        </>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add document"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Document Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDocumentMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/document/${selectedDocument?.id}`)
          handleDocumentMenuClose()
        }}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDocumentMenuClose}>
          <Share sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem onClick={handleDocumentMenuClose}>
          <Download sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleDeleteDocument(selectedDocument)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Document Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Document Title"
            value={newDocumentTitle}
            onChange={(e) => setNewDocumentTitle(e.target.value)}
            sx={{ mb: 3, mt: 1 }}
          />

          <FormControl fullWidth>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={newDocumentType}
              onChange={(e) => setNewDocumentType(e.target.value)}
              label="Document Type"
            >
              <MenuItem value="DOCUMENT">Document</MenuItem>
              <MenuItem value="SPREADSHEET">Spreadsheet</MenuItem>
              <MenuItem value="PRESENTATION">Presentation</MenuItem>
              <MenuItem value="CODE">Code File</MenuItem>
              <MenuItem value="MARKDOWN">Markdown</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateDocument}
            variant="contained"
            disabled={!newDocumentTitle.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default DocumentList
