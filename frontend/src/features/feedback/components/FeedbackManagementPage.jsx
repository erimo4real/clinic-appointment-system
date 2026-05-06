import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../../layout/MaterialDashboard/DashboardLayout';
import {
  Card, Typography, Box, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Tooltip,
  Select, MenuItem, FormControl, InputLabel, Rating
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../../shared/services/api';
import { useToast } from '../../../components/ui/Toast';

const statusColors = {
  pending: { bg: '#fff3e0', text: '#e65100', label: 'Pending' },
  reviewed: { bg: '#e3f2fd', text: '#0d47a1', label: 'Reviewed' },
  action_taken: { bg: '#e8f5e9', text: '#1b5e20', label: 'Action Taken' },
};

const sanitize = (str) => typeof str === 'string' ? str.trim().replace(/[<>]/g, '') : str;

const FeedbackManagementPage = () => {
  const toast = useToast();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({ status: '', adminNotes: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/feedback/admin/all');
      setFeedback(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load feedback');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    return feedback.filter(f => {
      const matchSearch = `${f.patient_name || ''} ${f.doctor_name || ''} ${f.reason || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || f.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [feedback, search, statusFilter]);

  const handleView = (fb) => {
    setSelectedFeedback(fb);
    setViewMode(true);
    setFormData({ status: fb.status, adminNotes: fb.adminNotes || '' });
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    setActionLoading(true);
    try {
      await api.put(`/feedback/admin/${selectedFeedback.id}`, formData);
      toast.success('Feedback updated');
      await loadData();
      setOpenDialog(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setActionLoading(false);
  };

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767' }}>Feedback</Typography>
            <Typography variant="body2" sx={{ color: '#7B809A' }}>{feedback.length} total feedback entries</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search feedback..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#7B809A' }} /></InputAdornment> }}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {Object.entries(statusColors).map(([key, val]) => (
                <MenuItem key={key} value={key}>{val.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>PATIENT</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>DOCTOR</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>RATING</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>TYPE</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>COMMENT</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>STATUS</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#7B809A' }}>No feedback found</TableCell></TableRow>
                  ) : filtered.map((fb) => {
                    const sc = statusColors[fb.status] || statusColors.pending;
                    return (
                      <TableRow key={fb.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4CAF50', fontSize: 12, fontWeight: 600 }}>
                              {(fb.patient_name || 'P')[0].toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', fontSize: '0.85rem' }}>{fb.patient_name || 'Unknown'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#7B809A', fontSize: '0.85rem', py: 1.25 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767' }}>{fb.doctor_name || 'N/A'}</Typography>
                            {fb.doctor_specialty && <Typography variant="caption" sx={{ color: '#7B809A' }}>{fb.doctor_specialty}</Typography>}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Rating value={fb.rating} readOnly size="small" />
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip
                            icon={fb.type === 'like' ? <ThumbUpIcon fontSize="small" /> : <ThumbDownIcon fontSize="small" />}
                            label={fb.type === 'like' ? 'Like' : 'Dislike'}
                            size="small"
                            sx={{ bgcolor: fb.type === 'like' ? '#e8f5e9' : '#ffebee', color: fb.type === 'like' ? '#4CAF50' : '#F44336', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#7B809A', fontSize: '0.85rem', py: 1.25, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {fb.reason || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.text, fontWeight: 700, fontSize: '0.75rem' }} />
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small" sx={{ color: '#1A73E8' }} onClick={() => handleView(fb)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: '#344767' }}>
            {viewMode ? 'Feedback Details' : 'Edit Feedback'}
          </DialogTitle>
          <DialogContent dividers>
            {selectedFeedback && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Patient</Typography>
                    <Typography variant="body2" sx={{ color: '#344767', fontWeight: 500 }}>{selectedFeedback.patient_name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Doctor</Typography>
                    <Typography variant="body2" sx={{ color: '#344767', fontWeight: 500 }}>{selectedFeedback.doctor_name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Rating</Typography>
                    <Rating value={selectedFeedback.rating} readOnly size="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Type</Typography>
                    <Typography variant="body2" sx={{ color: '#344767', fontWeight: 500, textTransform: 'capitalize' }}>{selectedFeedback.type}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Comment</Typography>
                  <Typography variant="body2" sx={{ color: '#344767', mt: 0.5 }}>{selectedFeedback.reason}</Typography>
                </Box>
                {selectedFeedback.response && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Doctor Response</Typography>
                    <Typography variant="body2" sx={{ color: '#344767', mt: 0.5 }}>{selectedFeedback.response}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Date</Typography>
                  <Typography variant="body2" sx={{ color: '#344767' }}>{selectedFeedback.createdAt ? new Date(selectedFeedback.createdAt).toLocaleString() : 'N/A'}</Typography>
                </Box>
                <Divider />
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    {Object.entries(statusColors).map(([key, val]) => (
                      <MenuItem key={key} value={key}>{val.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Admin Notes" multiline rows={3} fullWidth value={formData.adminNotes} onChange={(e) => setFormData({ ...formData, adminNotes: sanitize(e.target.value) })} />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
            <Button variant="contained" onClick={handleUpdate} disabled={actionLoading}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
              {actionLoading ? <CircularProgress size={20} /> : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default FeedbackManagementPage;
