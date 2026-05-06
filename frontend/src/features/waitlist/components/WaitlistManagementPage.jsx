import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../../layout/MaterialDashboard/DashboardLayout';
import {
  Card, Typography, Box, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Tooltip,
  Select, MenuItem, FormControl, InputLabel, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventNoteIcon from '@mui/icons-material/EventNote';
import api from '../../../shared/services/api';
import { useSelector } from 'react-redux';
import { useToast } from '../../../components/ui/Toast';

const sanitize = (str) => typeof str === 'string' ? str.trim().replace(/[<>]/g, '') : str;

const statusColors = {
  waiting: { bg: '#fff3e0', text: '#e65100', label: 'Waiting' },
  scheduled: { bg: '#e3f2fd', text: '#0d47a1', label: 'Scheduled' },
  cancelled: { bg: '#ffebee', text: '#b71c1c', label: 'Cancelled' },
  expired: { bg: '#f5f5f5', text: '#616161', label: 'Expired' },
};

const WaitlistManagementPage = () => {
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  const [waitlist, setWaitlist] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient: '', patientName: '', patientPhone: '', doctor: '', doctorName: '',
    preferredDate: '', preferredTime: '', reason: '', priority: 0, notes: '', status: 'waiting'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [wlRes, patientsRes, doctorsRes] = await Promise.all([
        api.get('/waitlist'),
        api.get('/admin/users').catch(() => ({ data: [] })),
        api.get('/doctors').catch(() => ({ data: [] })),
      ]);
      setWaitlist(Array.isArray(wlRes.data) ? wlRes.data : []);
      setPatients(Array.isArray(patientsRes.data) ? patientsRes.data.filter(u => u.role === 'patient') : []);
      setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
    } catch {
      toast.error('Failed to load waitlist');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    return waitlist.filter(w => {
      const patientName = w.patientName || w.patient?.firstName ? `${w.patient.firstName || ''} ${w.patient.lastName || ''}`.trim() : '';
      const doctorName = w.doctorName || w.doctor?.name || '';
      const matchSearch = `${patientName} ${doctorName} ${w.reason || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || w.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [waitlist, search, statusFilter]);

  const getPatientName = (w) => {
    if (w.patientName) return w.patientName;
    if (w.patient) return `${w.patient.firstName || ''} ${w.patient.lastName || ''}`.trim() || w.patient.username;
    return 'N/A';
  };

  const getDoctorName = (w) => {
    if (w.doctorName) return w.doctorName;
    if (w.doctor) return w.doctor.name || (w.doctor.user ? `Dr. ${w.doctor.user.firstName}` : '');
    return 'N/A';
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedEntry(null);
    setFormData({
      patient: '', patientName: '', patientPhone: '', doctor: '', doctorName: '',
      preferredDate: '', preferredTime: '', reason: '', priority: 0, notes: '', status: 'waiting'
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (entry) => {
    setEditMode(true);
    setSelectedEntry(entry);
    setFormData({
      patient: entry.patient?._id || entry.patient || '',
      patientName: entry.patientName || '',
      patientPhone: entry.patientPhone || '',
      doctor: entry.doctor?._id || entry.doctor || '',
      doctorName: entry.doctorName || '',
      preferredDate: entry.preferredDate ? new Date(entry.preferredDate).toISOString().split('T')[0] : '',
      preferredTime: entry.preferredTime || '',
      reason: entry.reason || '',
      priority: entry.priority || 0,
      notes: entry.notes || '',
      status: entry.status || 'waiting',
    });
    setOpenDialog(true);
  };

  const handleStatusUpdate = async (entry, newStatus) => {
    setActionLoading(true);
    try {
      await api.put(`/waitlist/${entry._id || entry.id}`, { status: newStatus });
      toast.success(`Waitlist entry ${newStatus}`);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setActionLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.patientName.trim()) { toast.error('Patient name is required'); return; }
    if (!formData.doctor) { toast.error('Doctor is required'); return; }
    if (!formData.preferredDate) { toast.error('Preferred date is required'); return; }
    setActionLoading(true);
    try {
      const payload = {
        patientName: sanitize(formData.patientName),
        patientPhone: sanitize(formData.patientPhone),
        doctor: formData.doctor,
        doctorName: sanitize(formData.doctorName),
        preferredDate: formData.preferredDate,
        preferredTime: sanitize(formData.preferredTime),
        reason: sanitize(formData.reason),
        priority: formData.priority || 0,
        notes: sanitize(formData.notes),
      };
      if (formData.patient) payload.patient = formData.patient;

      if (editMode && selectedEntry) {
        payload.status = formData.status;
        await api.put(`/waitlist/${selectedEntry._id || selectedEntry.id}`, payload);
        toast.success('Waitlist entry updated');
      } else {
        await api.post('/waitlist', payload);
        toast.success('Patient added to waitlist');
      }
      await loadData();
      setOpenDialog(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
    setActionLoading(false);
  };

  const handleDelete = async (entry) => {
    if (!window.confirm('Delete this waitlist entry?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/waitlist/${entry._id || entry.id}`);
      await loadData();
      toast.success('Waitlist entry deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767' }}>Waitlist</Typography>
            <Typography variant="body2" sx={{ color: '#7B809A' }}>{waitlist.length} total entries</Typography>
          </Box>
          {(user?.role === 'admin' || user?.role === 'receptionist') && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
              Add to Waitlist
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search waitlist..."
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
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>PREFERRED DATE</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>PREFERRED TIME</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>PRIORITY</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>STATUS</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#7B809A' }}>No waitlist entries found</TableCell></TableRow>
                  ) : filtered.map((entry) => {
                    const sc = statusColors[entry.status] || statusColors.waiting;
                    return (
                      <TableRow key={entry._id || entry.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#FF9800', fontSize: 12, fontWeight: 600 }}>
                              {(getPatientName(entry) || 'P')[0].toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', fontSize: '0.85rem' }}>
                                {getPatientName(entry)}
                              </Typography>
                              {entry.patientPhone && (
                                <Typography variant="caption" sx={{ color: '#7B809A' }}>{entry.patientPhone}</Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#7B809A', fontSize: '0.85rem', py: 1.25 }}>{getDoctorName(entry)}</TableCell>
                        <TableCell sx={{ color: '#7B809A', fontSize: '0.85rem', py: 1.25 }}>
                          {entry.preferredDate ? new Date(entry.preferredDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell sx={{ color: '#7B809A', fontSize: '0.85rem', py: 1.25 }}>
                          {entry.preferredTime || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip label={entry.priority || 0} size="small"
                            sx={{
                              bgcolor: entry.priority > 5 ? '#ffebee' : entry.priority > 0 ? '#fff3e0' : '#f5f5f5',
                              color: entry.priority > 5 ? '#F44336' : entry.priority > 0 ? '#FF9800' : '#7B809A',
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip
                            label={sc.label}
                            size="small"
                            sx={{ bgcolor: sc.bg, color: sc.text, fontWeight: 700, fontSize: '0.75rem', cursor: entry.status === 'waiting' ? 'pointer' : 'default' }}
                            onClick={() => entry.status === 'waiting' && handleStatusUpdate(entry, 'scheduled')}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Edit">
                              <IconButton size="small" sx={{ color: '#1A73E8' }} onClick={() => handleOpenEdit(entry)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" sx={{ color: '#F44336' }} onClick={() => handleDelete(entry)} disabled={actionLoading}>
                                <DeleteIcon fontSize="small" />
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
            {editMode ? 'Edit Waitlist Entry' : 'Add to Waitlist'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Patient</InputLabel>
                <Select value={formData.patient} label="Patient" onChange={(e) => {
                  const val = e.target.value;
                  const p = patients.find(p => (p._id || p.id) === val);
                  setFormData({
                    ...formData,
                    patient: val,
                    patientName: p ? `${p.firstName || ''} ${p.lastName || ''}`.trim() : formData.patientName,
                    patientPhone: p?.phone || formData.patientPhone,
                  });
                }}>
                  <MenuItem value="">Select Patient</MenuItem>
                  {patients.map(p => (
                    <MenuItem key={p._id || p.id} value={p._id || p.id}>{p.firstName || ''} {p.lastName || ''} ({p.email})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Patient Name" fullWidth required value={formData.patientName} onChange={(e) => setFormData({ ...formData, patientName: e.target.value })} />
              <TextField label="Patient Phone" fullWidth value={formData.patientPhone} onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })} />
              <FormControl fullWidth>
                <InputLabel>Doctor</InputLabel>
                <Select value={formData.doctor} label="Doctor" onChange={(e) => {
                  const val = e.target.value;
                  const d = doctors.find(d => (d._id || d.id) === val);
                  setFormData({
                    ...formData,
                    doctor: val,
                    doctorName: d ? (d.name || `${d.user?.firstName || ''} ${d.user?.lastName || ''}`.trim()) : formData.doctorName,
                  });
                }}>
                  <MenuItem value="">Select Doctor</MenuItem>
                  {doctors.map(d => {
                    const name = d.name || `${d.user?.firstName || ''} ${d.user?.lastName || ''}`.trim() || d.user?.username || '';
                    return <MenuItem key={d._id || d.id} value={d._id || d.id}>Dr. {name}</MenuItem>;
                  })}
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Preferred Date" type="date" fullWidth required InputLabelProps={{ shrink: true }} value={formData.preferredDate} onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })} />
                <TextField label="Preferred Time" fullWidth value={formData.preferredTime} onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })} placeholder="e.g. 09:00" />
              </Box>
              <TextField label="Reason" fullWidth multiline rows={2} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
              <TextField label="Priority (0-10)" type="number" fullWidth value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })} inputProps={{ min: 0, max: 10 }} />
              {editMode && (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    {Object.entries(statusColors).map(([key, val]) => (
                      <MenuItem key={key} value={key}>{val.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <TextField label="Notes" fullWidth value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={actionLoading}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
              {actionLoading ? <CircularProgress size={20} /> : editMode ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default WaitlistManagementPage;
