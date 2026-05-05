import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments, updateAppointmentStatus } from '../../appointments/store/appointmentSlice';
import DashboardLayout from '../../../layout/MaterialDashboard/DashboardLayout';
import {
  Card, CardContent, Typography, Box, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, IconButton, Button, Select, MenuItem,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import api from '../../../shared/services/api';
import { useToast } from '../../../components/ui/Toast';

const statusColors = {
  pending: { bg: '#fff3e0', text: '#e65100', label: 'Pending' },
  confirmed: { bg: '#e3f2fd', text: '#0d47a1', label: 'Confirmed' },
  in_progress: { bg: '#f3e5f5', text: '#4a148c', label: 'In Progress' },
  completed: { bg: '#e8f5e9', text: '#1b5e20', label: 'Completed' },
  cancelled: { bg: '#ffebee', text: '#b71c1c', label: 'Cancelled' },
  no_show: { bg: '#f5f5f5', text: '#616161', label: 'No Show' },
};

const AppointmentsManagementPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { appointments, loadingAppointments } = useSelector((state) => state.appointments);
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (user?.role === 'admin' || user?.role === 'receptionist') {
        try {
          const res = await api.get('/admin/appointments');
          setAllAppointments(Array.isArray(res.data) ? res.data : []);
        } catch {
          await dispatch(fetchAppointments());
          setAllAppointments([]);
        }
      } else {
        await dispatch(fetchAppointments());
        setAllAppointments([]);
      }
      setLoading(false);
    };
    loadData();
  }, [dispatch, user?.role]);

  const data = useMemo(() => {
    const source = (user?.role === 'admin' || user?.role === 'receptionist') ? allAppointments : appointments;
    return source.filter(a => {
      const patientName = a.patient?.firstName ? `${a.patient.firstName} ${a.patient.lastName}` : a.patient_name || a.guestName || '';
      const doctorName = a.doctor?.name || a.doctor?.user?.firstName ? `Dr. ${a.doctor.user?.firstName || ''} ${a.doctor.user?.lastName || ''}`.trim() : a.doctor_name || '';
      const matchSearch = patientName.toLowerCase().includes(search.toLowerCase()) || doctorName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [allAppointments, appointments, search, statusFilter, user?.role]);

  const getPatientName = (apt) => {
    if (apt.patient) return `${apt.patient.firstName || ''} ${apt.patient.lastName || ''}`.trim() || apt.patient.username;
    return apt.patient_name || apt.guestName || 'Guest';
  };

  const getDoctorName = (apt) => {
    if (apt.doctor) {
      if (apt.doctor.name) return `Dr. ${apt.doctor.name}`;
      if (apt.doctor.user) return `Dr. ${apt.doctor.user.firstName || ''} ${apt.doctor.user.lastName || ''}`.trim();
    }
    return apt.doctor_name || 'N/A';
  };

  const getServiceName = (apt) => {
    if (apt.service) return apt.service.name;
    return apt.service_name || 'N/A';
  };

  const handleStatusUpdate = async () => {
    if (!selectedAppt || !newStatus) { toast.error('Please select a status'); return; }
    setActionLoading(true);
    try {
      if (user?.role === 'admin' || user?.role === 'receptionist') {
        await api.put(`/admin/appointments/${selectedAppt._id || selectedAppt.id}`, { status: newStatus });
      } else {
        await dispatch(updateAppointmentStatus({ id: selectedAppt._id || selectedAppt.id, status: newStatus }));
      }
      toast.success('Appointment status updated');
      setOpenStatusDialog(false);
      if (user?.role === 'admin' || user?.role === 'receptionist') {
        const res = await api.get('/admin/appointments');
        setAllAppointments(Array.isArray(res.data) ? res.data : []);
      } else {
        dispatch(fetchAppointments());
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
    setActionLoading(false);
  };

  const handleDelete = async (apt) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    setActionLoading(true);
    try {
      if (user?.role === 'admin' || user?.role === 'receptionist') {
        await api.delete(`/admin/appointments/${apt._id || apt.id}`);
      } else {
        await api.delete(`/appointments/${apt._id || apt.id}`);
      }
      toast.success('Appointment deleted successfully');
      if (user?.role === 'admin' || user?.role === 'receptionist') {
        const res = await api.get('/admin/appointments');
        setAllAppointments(Array.isArray(res.data) ? res.data : []);
      } else {
        dispatch(fetchAppointments());
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
    setActionLoading(false);
  };

  if (loading || loadingAppointments) {
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
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767' }}>Appointments</Typography>
            <Typography variant="body2" sx={{ color: '#7B809A' }}>Manage all appointments</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search appointments..."
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
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>SERVICE</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>DATE & TIME</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>STATUS</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#7B809A' }}>No appointments found</TableCell></TableRow>
                  ) : data.map((apt) => {
                    const sc = statusColors[apt.status] || statusColors.pending;
                    return (
                      <TableRow key={apt._id || apt.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1A73E8', fontSize: 12, fontWeight: 600 }}>
                              {(getPatientName(apt) || 'P')[0].toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', fontSize: '0.85rem' }}>
                              {getPatientName(apt)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#7B809A', fontSize: '0.85rem', py: 1.25 }}>{getDoctorName(apt)}</TableCell>
                        <TableCell sx={{ color: '#7B809A', fontSize: '0.85rem', py: 1.25 }}>{getServiceName(apt)}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', fontSize: '0.85rem' }}>
                            {apt.date ? new Date(apt.date).toLocaleDateString() : 'N/A'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#7B809A' }}>
                            {apt.startTime || ''} - {apt.endTime || ''}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.text, fontWeight: 700, fontSize: '0.75rem' }} />
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small" sx={{ color: '#7B809A' }} onClick={() => { setSelectedAppt(apt); setOpenDialog(true); }}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {(user?.role === 'admin' || user?.role === 'receptionist' || user?.role === 'doctor') && (
                              <Tooltip title="Update Status">
                                <IconButton size="small" sx={{ color: '#1A73E8' }} onClick={() => { setSelectedAppt(apt); setNewStatus(apt.status); setOpenStatusDialog(true); }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {(user?.role === 'admin' || user?.role === 'receptionist') && (
                              <Tooltip title="Delete">
                                <IconButton size="small" sx={{ color: '#F44336' }} onClick={() => handleDelete(apt)} disabled={actionLoading}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
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

        {/* View Details Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: '#344767' }}>Appointment Details</DialogTitle>
          <DialogContent dividers>
            {selectedAppt && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                {[
                  ['Patient', getPatientName(selectedAppt)],
                  ['Doctor', getDoctorName(selectedAppt)],
                  ['Service', getServiceName(selectedAppt)],
                  ['Date', selectedAppt.date ? new Date(selectedAppt.date).toLocaleDateString() : 'N/A'],
                  ['Time', `${selectedAppt.startTime || 'N/A'} - ${selectedAppt.endTime || 'N/A'}`],
                  ['Status', statusColors[selectedAppt.status]?.label || selectedAppt.status],
                  ['Notes', selectedAppt.notes || 'None'],
                  ['Created', selectedAppt.createdAt ? new Date(selectedAppt.createdAt).toLocaleString() : 'N/A'],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>{label}</Typography>
                    <Typography variant="body2" sx={{ color: '#344767', fontWeight: 500 }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
          <DialogTitle sx={{ fontWeight: 700, color: '#344767' }}>Update Status</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select value={newStatus} label="Status" onChange={(e) => setNewStatus(e.target.value)}>
                {Object.entries(statusColors).map(([key, val]) => (
                  <MenuItem key={key} value={key}>{val.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleStatusUpdate} disabled={actionLoading} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
              {actionLoading ? <CircularProgress size={20} /> : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default AppointmentsManagementPage;
