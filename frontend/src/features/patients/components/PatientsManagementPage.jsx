import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../../layout/MaterialDashboard/DashboardLayout';
import {
  Card, CardContent, Typography, Box, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Tooltip, Alert,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import api from '../../../shared/services/api';
import { useSelector } from 'react-redux';
import ImageUploadDialog from '../../../shared/components/ImageUploadDialog';

const PatientsManagementPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageDialogPatient, setImageDialogPatient] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', firstName: '', lastName: '', phone: '', role: 'patient'
  });

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      const patientList = Array.isArray(res.data) ? res.data.filter(u => u.role === 'patient') : [];
      setPatients(patientList);
    } catch (err) {
      console.error('Failed to load patients:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filtered = useMemo(() => {
    return patients.filter(p => {
      const name = `${p.first_name || p.firstName || ''} ${p.last_name || p.lastName || ''} ${p.username || ''} ${p.email || ''}`.toLowerCase();
      return name.includes(search.toLowerCase());
    });
  }, [patients, search]);

  const getPatientName = (p) => `${p.first_name || p.firstName || ''} ${p.last_name || p.lastName || ''}`.trim() || p.username || 'Patient';

  const getInitials = (p) => {
    const name = `${p.first_name || p.firstName || p.username || 'P'} ${p.last_name || p.lastName || ''}`;
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedPatient(null);
    setFormData({ username: '', email: '', password: '', firstName: '', lastName: '', phone: '', role: 'patient' });
    setError('');
    setSuccess('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (patient) => {
    setEditMode(true);
    setSelectedPatient(patient);
    setFormData({
      username: patient.username || '',
      email: patient.email || '',
      password: '',
      firstName: patient.firstName || patient.first_name || '',
      lastName: patient.lastName || patient.last_name || '',
      phone: patient.phone || '',
      role: patient.role || 'patient',
    });
    setError('');
    setSuccess('');
    setOpenDialog(true);
  };

  const handleOpenImageUpload = (patient) => {
    setImageDialogPatient(patient);
    setImageDialogOpen(true);
  };

  const handleImageUploadSuccess = async () => {
    await loadPatients();
  };

  const handleSubmit = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      if (editMode && selectedPatient) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/users/${selectedPatient._id || selectedPatient.id}`, payload);
        setSuccess('Patient updated successfully');
      } else {
        if (!formData.password) { setError('Password is required'); setActionLoading(false); return; }
        await api.post('/admin/users', formData);
        setSuccess('Patient created successfully');
      }
      await loadPatients();
      setTimeout(() => setOpenDialog(false), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
    setActionLoading(false);
  };

  const handleDelete = async (patient) => {
    if (!window.confirm(`Delete ${getPatientName(patient)}? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/users/${patient._id || patient.id}`);
      await loadPatients();
      setSuccess('Patient deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
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
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767' }}>Patients</Typography>
            <Typography variant="body2" sx={{ color: '#7B809A' }}>{patients.length} registered patients</Typography>
          </Box>
          {(user?.role === 'admin' || user?.role === 'receptionist') && (
            <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleOpenCreate}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
              Add Patient
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

        <Box sx={{ mb: 2 }}>
          <TextField
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#7B809A' }} /></InputAdornment> }}
            size="small"
          />
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>PHOTO</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>PATIENT</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>EMAIL</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>PHONE</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>JOINED</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>STATUS</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#7B809A' }}>No patients found</TableCell></TableRow>
                  ) : filtered.map((patient) => (
                    <TableRow key={patient._id || patient.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                      <TableCell sx={{ py: 1.25 }}>
                        <Box
                          onClick={() => handleOpenImageUpload(patient)}
                          sx={{
                            width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer',
                            position: 'relative', border: '2px solid',
                            borderColor: patient.profileImage ? '#4CAF50' : '#e0e0e0',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#1A73E8', boxShadow: '0 0 0 3px rgba(26,115,232,0.2)' },
                          }}
                        >
                          {patient.profileImage ? (
                            <img src={patient.profileImage} alt={getPatientName(patient)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                              <PhotoCameraIcon sx={{ fontSize: 18, color: '#bbb' }} />
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: '#4CAF50', fontSize: 13, fontWeight: 600 }}>
                            {getInitials(patient)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', fontSize: '0.85rem' }}>
                              {getPatientName(patient)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#7B809A' }}>@{patient.username}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: '#4CAF50', fontSize: 13, fontWeight: 600 }}>
                            {getInitials(patient)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', fontSize: '0.85rem' }}>
                              {getPatientName(patient)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#7B809A' }}>@{patient.username}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <EmailIcon sx={{ fontSize: 16, color: '#7B809A' }} />
                          <Typography variant="body2" sx={{ color: '#344767', fontSize: '0.85rem' }}>{patient.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: '#7B809A' }} />
                          <Typography variant="body2" sx={{ color: '#7B809A', fontSize: '0.85rem' }}>{patient.phone || 'N/A'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#7B809A', fontSize: '0.85rem', py: 1.25 }}>
                        {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ py: 1.25 }}>
                        <Chip label={patient.isActive !== false ? 'Active' : 'Inactive'} size="small"
                          color={patient.isActive !== false ? 'success' : 'default'} sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
                      </TableCell>
                      <TableCell sx={{ py: 1.25 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Change Photo">
                            <IconButton size="small" sx={{ color: '#9C27B0' }} onClick={() => handleOpenImageUpload(patient)}>
                              <PhotoCameraIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" sx={{ color: '#1A73E8' }} onClick={() => handleOpenEdit(patient)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" sx={{ color: '#F44336' }} onClick={() => handleDelete(patient)} disabled={actionLoading}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: '#344767' }}>
            {editMode ? 'Edit Patient' : 'Add New Patient'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="First Name" fullWidth value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                <TextField label="Last Name" fullWidth value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </Box>
              <TextField label="Username" fullWidth value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
              <TextField label="Email" type="email" fullWidth value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              <TextField label={editMode ? 'New Password (leave blank to keep)' : 'Password'} type="password" fullWidth value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editMode} />
              <TextField label="Phone" fullWidth value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              {(user?.role === 'admin') && (
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select value={formData.role} label="Role" onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                    <MenuItem value="patient">Patient</MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="receptionist">Receptionist</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={actionLoading}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
              {actionLoading ? <CircularProgress size={20} /> : editMode ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        <ImageUploadDialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          entity={imageDialogPatient}
          entityId={imageDialogPatient?._id || imageDialogPatient?.id}
          updateEndpoint={`/admin/users/${imageDialogPatient?._id || imageDialogPatient?.id}`}
          onSuccess={handleImageUploadSuccess}
          entityName={imageDialogPatient ? getPatientName(imageDialogPatient) : 'Patient'}
        />
      </Box>
    </DashboardLayout>
  );
};

export default PatientsManagementPage;
