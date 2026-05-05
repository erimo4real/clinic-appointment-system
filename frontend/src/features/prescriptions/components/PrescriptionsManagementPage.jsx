import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../../layout/MaterialDashboard/DashboardLayout';
import {
  Card, CardContent, Typography, Box, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Tooltip,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../../shared/services/api';
import { useSelector } from 'react-redux';
import { useToast } from '../../../components/ui/Toast';

const sanitize = (str) => typeof str === 'string' ? str.trim().replace(/[<>]/g, '') : str;

const statusColors = {
  active: { bg: '#e8f5e9', text: '#1b5e20', label: 'Active' },
  completed: { bg: '#e3f2fd', text: '#0d47a1', label: 'Completed' },
  cancelled: { bg: '#ffebee', text: '#b71c1c', label: 'Cancelled' },
};

const PrescriptionsManagementPage = () => {
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient: '', doctor: '', notes: '', status: 'active',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [rxRes, patientsRes, doctorsRes] = await Promise.all([
        api.get('/prescriptions'),
        (user?.role === 'admin' || user?.role === 'receptionist') ? api.get('/admin/users').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        api.get('/doctors').catch(() => ({ data: [] })),
      ]);
      let rxList = Array.isArray(rxRes.data) ? rxRes.data : [];
      if (user?.role === 'admin' || user?.role === 'receptionist') {
        const allPatients = Array.isArray(patientsRes.data) ? patientsRes.data.filter(u => u.role === 'patient') : [];
        setPatients(allPatients);
      }
      setPrescriptions(rxList);
      setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.role]);

  const filtered = useMemo(() => {
    return prescriptions.filter(rx => {
      const patientName = rx.patient?.firstName ? `${rx.patient.firstName} ${rx.patient.lastName}` : '';
      const doctorName = rx.doctor?.name || (rx.doctor?.user?.firstName ? `Dr. ${rx.doctor.user.firstName}` : '');
      const matchSearch = `${patientName} ${doctorName} ${rx.notes || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || rx.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [prescriptions, search, statusFilter]);

  const getPatientName = (rx) => {
    if (rx.patient) return `${rx.patient.firstName || ''} ${rx.patient.lastName || ''}`.trim() || rx.patient.username;
    return 'N/A';
  };

  const getDoctorName = (rx) => {
    if (rx.doctor) {
      if (rx.doctor.name) return `Dr. ${rx.doctor.name}`;
      if (rx.doctor.user) return `Dr. ${rx.doctor.user.firstName || ''} ${rx.doctor.user.lastName || ''}`.trim();
    }
    return 'N/A';
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setViewMode(false);
    setSelectedRx(null);
    setFormData({
      patient: '', doctor: '', notes: '', status: 'active',
      medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (rx) => {
    setEditMode(true);
    setViewMode(false);
    setSelectedRx(rx);
    setFormData({
      patient: rx.patient?._id || rx.patient || '',
      doctor: rx.doctor?._id || rx.doctor || '',
      notes: rx.notes || '',
      status: rx.status || 'active',
      medicines: rx.medicines && rx.medicines.length > 0 ? [...rx.medicines] : [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
    setOpenDialog(true);
  };

  const handleView = (rx) => {
    setSelectedRx(rx);
    setViewMode(true);
    setEditMode(false);
    setOpenDialog(true);
  };

  const handleAddMedicine = () => {
    setFormData({ ...formData, medicines: [...formData.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }] });
  };

  const handleRemoveMedicine = (index) => {
    if (formData.medicines.length <= 1) return;
    const updated = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: updated });
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = formData.medicines.map((med, i) => i === index ? { ...med, [field]: value } : med);
    setFormData({ ...formData, medicines: updated });
  };

  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      if (editMode && selectedRx) {
        const payload = {
          notes: sanitize(formData.notes),
          status: formData.status,
          medicines: formData.medicines.map(m => ({
            name: sanitize(m.name),
            dosage: sanitize(m.dosage),
            frequency: sanitize(m.frequency),
            duration: sanitize(m.duration),
            instructions: sanitize(m.instructions),
          })),
        };
        await api.put(`/prescriptions/${selectedRx._id || selectedRx.id}`, payload);
        toast.success('Prescription updated successfully');
      } else {
        const validMeds = formData.medicines.filter(m => m.name.trim());
        if (!formData.patient) { toast.error('Patient is required'); setActionLoading(false); return; }
        if (!formData.doctor) { toast.error('Doctor is required'); setActionLoading(false); return; }
        if (validMeds.length === 0) { toast.error('Add at least one medicine'); setActionLoading(false); return; }
        const payload = {
          patient: formData.patient,
          doctor: formData.doctor,
          notes: sanitize(formData.notes),
          status: formData.status,
          medicines: validMeds.map(m => ({
            name: sanitize(m.name),
            dosage: sanitize(m.dosage),
            frequency: sanitize(m.frequency),
            duration: sanitize(m.duration),
            instructions: sanitize(m.instructions),
          })),
        };
        await api.post('/prescriptions', payload);
        toast.success('Prescription created successfully');
      }
      await loadData();
      setOpenDialog(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
    setActionLoading(false);
  };

  const handleDelete = async (rx) => {
    if (!window.confirm('Delete this prescription?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/prescriptions/${rx._id || rx.id}`);
      await loadData();
      toast.success('Prescription deleted successfully');
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
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767' }}>Prescriptions</Typography>
            <Typography variant="body2" sx={{ color: '#7B809A' }}>{prescriptions.length} total prescriptions</Typography>
          </Box>
          {(user?.role === 'doctor' || user?.role === 'admin') && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
              New Prescription
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search prescriptions..."
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
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>MEDICINES</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>DATE</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>STATUS</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#7B809A' }}>No prescriptions found</TableCell></TableRow>
                  ) : filtered.map((rx) => {
                    const sc = statusColors[rx.status] || statusColors.active;
                    return (
                      <TableRow key={rx._id || rx.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4CAF50', fontSize: 12, fontWeight: 600 }}>
                              {(getPatientName(rx) || 'P')[0].toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', fontSize: '0.85rem' }}>
                              {getPatientName(rx)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#7B809A', fontSize: '0.85rem', py: 1.25 }}>{getDoctorName(rx)}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Typography variant="body2" sx={{ color: '#344767', fontSize: '0.85rem' }}>
                            {rx.medicines?.length || 0} medicine{(rx.medicines?.length || 0) !== 1 ? 's' : ''}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: '#7B809A', fontSize: '0.85rem', py: 1.25 }}>
                          {rx.dateIssued ? new Date(rx.dateIssued).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.text, fontWeight: 700, fontSize: '0.75rem' }} />
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View">
                              <IconButton size="small" sx={{ color: '#7B809A' }} onClick={() => handleView(rx)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {(user?.role === 'doctor' || user?.role === 'admin') && (
                              <Tooltip title="Edit">
                                <IconButton size="small" sx={{ color: '#1A73E8' }} onClick={() => handleOpenEdit(rx)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {user?.role === 'admin' && (
                              <Tooltip title="Delete">
                                <IconButton size="small" sx={{ color: '#F44336' }} onClick={() => handleDelete(rx)} disabled={actionLoading}>
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

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: '#344767' }}>
            {viewMode ? 'Prescription Details' : editMode ? 'Edit Prescription' : 'New Prescription'}
          </DialogTitle>
          <DialogContent dividers>
            {viewMode && selectedRx ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  {[
                    ['Patient', getPatientName(selectedRx)],
                    ['Doctor', getDoctorName(selectedRx)],
                    ['Date', selectedRx.dateIssued ? new Date(selectedRx.dateIssued).toLocaleDateString() : 'N/A'],
                    ['Status', statusColors[selectedRx.status]?.label || selectedRx.status],
                  ].map(([label, value]) => (
                    <Box key={label}>
                      <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>{label}</Typography>
                      <Typography variant="body2" sx={{ color: '#344767', fontWeight: 500 }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Medicines</Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {selectedRx.medicines?.map((med, i) => (
                      <Card key={i} variant="outlined" sx={{ p: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#344767' }}>{med.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#7B809A' }}>
                          {med.dosage} • {med.frequency} • {med.duration}
                        </Typography>
                        {med.instructions && <Typography variant="caption" sx={{ color: '#7B809A', display: 'block' }}>Instructions: {med.instructions}</Typography>}
                      </Card>
                    ))}
                  </Box>
                </Box>
                {selectedRx.notes && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Notes</Typography>
                    <Typography variant="body2" sx={{ color: '#344767' }}>{selectedRx.notes}</Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(user?.role === 'admin' || user?.role === 'receptionist') && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Patient</InputLabel>
                      <Select value={formData.patient} label="Patient" onChange={(e) => setFormData({ ...formData, patient: e.target.value })}>
                        <MenuItem value="">Select Patient</MenuItem>
                        {patients.map(p => (
                          <MenuItem key={p._id || p.id} value={p._id || p.id}>{p.firstName || ''} {p.lastName || ''} ({p.email})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth>
                      <InputLabel>Doctor</InputLabel>
                      <Select value={formData.doctor} label="Doctor" onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}>
                        <MenuItem value="">Select Doctor</MenuItem>
                        {doctors.map(d => {
                          const name = d.name || `${d.user?.firstName || ''} ${d.user?.lastName || ''}`.trim() || d.user?.username || '';
                          return <MenuItem key={d._id || d.id} value={d._id || d.id}>Dr. {name}</MenuItem>;
                        })}
                      </Select>
                    </FormControl>
                  </Box>
                )}
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    {Object.entries(statusColors).map(([key, val]) => (
                      <MenuItem key={key} value={key}>{val.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#344767' }}>Medicines</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={handleAddMedicine} sx={{ textTransform: 'none' }}>
                      Add Medicine
                    </Button>
                  </Box>
                  {formData.medicines.map((med, index) => (
                    <Card key={index} variant="outlined" sx={{ p: 2, mb: 1.5, position: 'relative' }}>
                      {formData.medicines.length > 1 && (
                        <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8, color: '#F44336' }} onClick={() => handleRemoveMedicine(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <TextField label="Medicine Name" size="small" fullWidth value={med.name} onChange={(e) => handleMedicineChange(index, 'name', e.target.value)} />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <TextField label="Dosage" size="small" fullWidth value={med.dosage} onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)} placeholder="e.g. 500mg" />
                          <TextField label="Frequency" size="small" fullWidth value={med.frequency} onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)} placeholder="e.g. 3x daily" />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <TextField label="Duration" size="small" fullWidth value={med.duration} onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)} placeholder="e.g. 7 days" />
                          <TextField label="Instructions" size="small" fullWidth value={med.instructions} onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)} placeholder="e.g. After meals" />
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>

                <TextField label="Notes" multiline rows={3} fullWidth value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>{viewMode ? 'Close' : 'Cancel'}</Button>
            {!viewMode && (
              <Button variant="contained" onClick={handleSubmit} disabled={actionLoading}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
                {actionLoading ? <CircularProgress size={20} /> : editMode ? 'Update' : 'Create'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default PrescriptionsManagementPage;
