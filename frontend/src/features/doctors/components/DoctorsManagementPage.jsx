import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../../layout/MaterialDashboard/DashboardLayout';
import {
  Card, CardContent, Typography, Box, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Alert, Tooltip,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import api from '../../../shared/services/api';
import { useSelector } from 'react-redux';
import ImageUploadDialog from '../../../shared/components/ImageUploadDialog';
import { useToast } from '../../../components/ui/Toast';

const specialties = [
  'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
  'Dermatology', 'Ophthalmology', 'ENT', 'Gynecology', 'Psychiatry',
  'Oncology', 'Gastroenterology', 'Pulmonology', 'Urology', 'Nephrology',
  'Endocrinology', 'Rheumatology', 'Other'
];

const sanitize = (str) => typeof str === 'string' ? str.trim().replace(/[<>]/g, '') : str;
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const DoctorsManagementPage = () => {
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [ratings, setRatings] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageDialogDoctor, setImageDialogDoctor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    specialty: '', qualification: '', experience: '', consultationFee: '', bio: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [docRes, fbRes] = await Promise.all([
        api.get('/admin/doctors'),
        api.get('/feedback').catch(() => ({ data: [] })),
      ]);
      setDoctors(Array.isArray(docRes.data) ? docRes.data : []);
      if (Array.isArray(fbRes.data)) {
        const r = {};
        fbRes.data.forEach(fb => {
          const did = fb.doctor_id?._id || fb.doctor_id;
          if (did) {
            if (!r[did]) r[did] = { sum: 0, count: 0 };
            r[did].sum += fb.rating || 0;
            r[did].count += 1;
          }
        });
        Object.keys(r).forEach(id => { r[id].avg = r[id].sum / r[id].count; });
        setRatings(r);
      }
    } catch (err) {
      toast.error('Failed to load doctors');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return doctors.filter(d => {
      const name = (d.name || d.first_name || d.user?.firstName || '').toLowerCase();
      const spec = (d.specialty || '').toLowerCase();
      const matchSearch = name.includes(search.toLowerCase()) || spec.includes(search.toLowerCase());
      const matchSpecialty = !specialtyFilter || d.specialty === specialtyFilter;
      return matchSearch && matchSpecialty;
    });
  }, [doctors, search, specialtyFilter]);

  const getDoctorName = (d) => d.name || `${d.first_name || d.user?.firstName || ''} ${d.last_name || d.user?.lastName || ''}`.trim() || 'Doctor';

  const getInitials = (d) => {
    const name = d.name || `${d.first_name || d.user?.firstName || ''} ${d.last_name || d.user?.lastName || ''}`;
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'D';
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedDoctor(null);
    setFormData({ name: '', email: '', phone: '', password: '', specialty: '', qualification: '', experience: '', consultationFee: '', bio: '' });
    setFormError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (doctor) => {
    setEditMode(true);
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name || `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() || '',
      email: doctor.email || doctor.user?.email || '',
      phone: doctor.phone || doctor.user?.phone || '',
      password: '',
      specialty: doctor.specialty || '',
      qualification: doctor.qualification || '',
      experience: doctor.experience || '',
      consultationFee: doctor.consultationFee || doctor.consultation_fee || '',
      bio: doctor.bio || '',
    });
    setFormError('');
    setOpenDialog(true);
  };

  const handleOpenImageUpload = (doctor) => {
    setImageDialogDoctor(doctor);
    setImageDialogOpen(true);
  };

  const handleImageUploadSuccess = async () => {
    await loadData();
    toast.success('Profile photo updated');
  };

  const validateForm = () => {
    if (!formData.name.trim()) { setFormError('Name is required'); return false; }
    if (!formData.email.trim()) { setFormError('Email is required'); return false; }
    if (!isValidEmail(formData.email)) { setFormError('Invalid email format'); return false; }
    if (!editMode && !formData.password) { setFormError('Password is required'); return false; }
    if (formData.password && formData.password.length < 6) { setFormError('Password must be at least 6 characters'); return false; }
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) { setFormError('Invalid phone number'); return false; }
    if (formData.experience && (isNaN(formData.experience) || Number(formData.experience) < 0)) { setFormError('Experience must be a positive number'); return false; }
    if (formData.consultationFee && (isNaN(formData.consultationFee) || Number(formData.consultationFee) < 0)) { setFormError('Fee must be a positive number'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setActionLoading(true);
    setFormError('');
    try {
      if (editMode) {
        const payload = {
          name: sanitize(formData.name),
          email: sanitize(formData.email).toLowerCase(),
          phone: sanitize(formData.phone),
          specialty: sanitize(formData.specialty),
          qualification: sanitize(formData.qualification),
          experience: formData.experience ? Number(formData.experience) : undefined,
          consultationFee: formData.consultationFee ? Number(formData.consultationFee) : undefined,
          bio: sanitize(formData.bio),
        };
        if (formData.password) payload.password = formData.password;
        payload.is_available = true;
        await api.put(`/admin/doctors/${selectedDoctor._id || selectedDoctor.id}`, payload);
        toast.success('Doctor updated successfully');
      } else {
        const payload = {
          name: sanitize(formData.name),
          email: sanitize(formData.email).toLowerCase(),
          phone: sanitize(formData.phone),
          password: formData.password,
        };
        await api.post('/admin/doctors', payload);
        toast.success('Doctor created successfully');
      }
      await loadData();
      setOpenDialog(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
      toast.error(err.response?.data?.message || 'Operation failed');
    }
    setActionLoading(false);
  };

  const handleDelete = async (doctor) => {
    if (!window.confirm(`Delete ${getDoctorName(doctor)}? This will remove their account and appointments.`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/doctors/${doctor._id || doctor.id}`);
      await loadData();
      toast.success('Doctor deleted successfully');
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
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767' }}>Doctors</Typography>
            <Typography variant="body2" sx={{ color: '#7B809A' }}>{doctors.length} registered doctors</Typography>
          </Box>
          {(user?.role === 'admin' || user?.role === 'receptionist') && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
              Add Doctor
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#7B809A' }} /></InputAdornment> }}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Specialty</InputLabel>
            <Select value={specialtyFilter} label="Specialty" onChange={(e) => setSpecialtyFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {specialties.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>PHOTO</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>DOCTOR</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>SPECIALTY</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>QUALIFICATION</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>EXPERIENCE</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>FEE</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>RATING</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>STATUS</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={9} sx={{ textAlign: 'center', py: 6, color: '#7B809A' }}>No doctors found</TableCell></TableRow>
                  ) : filtered.map((doctor) => {
                    const doctorId = doctor._id || doctor.id;
                    const avgRating = ratings[doctorId]?.avg || 0;
                    const ratingCount = ratings[doctorId]?.count || 0;
                    return (
                      <TableRow key={doctorId} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box onClick={() => handleOpenImageUpload(doctor)} sx={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: '2px solid', borderColor: doctor.profileImage ? '#4CAF50' : '#e0e0e0', transition: 'all 0.2s', '&:hover': { borderColor: '#1A73E8', boxShadow: '0 0 0 3px rgba(26,115,232,0.2)' } }}>
                            {doctor.profileImage ? (
                              <img src={doctor.profileImage} alt={getDoctorName(doctor)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                                <PhotoCameraIcon sx={{ fontSize: 18, color: '#bbb' }} />
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #1A73E8, #4285F4)', fontSize: 13, fontWeight: 600 }}>{getInitials(doctor)}</Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', fontSize: '0.85rem' }}>{getDoctorName(doctor)}</Typography>
                              <Typography variant="caption" sx={{ color: '#7B809A' }}>{doctor.email || 'N/A'}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip label={doctor.specialty || 'General'} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1A73E8', fontWeight: 600, fontSize: '0.75rem' }} />
                        </TableCell>
                        <TableCell sx={{ color: '#7B809A', fontSize: '0.85rem', py: 1.25 }}>{doctor.qualification || 'N/A'}</TableCell>
                        <TableCell sx={{ color: '#7B809A', fontSize: '0.85rem', py: 1.25 }}>{doctor.experience ? `${doctor.experience} yrs` : 'N/A'}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#4CAF50', fontSize: '0.85rem', py: 1.25 }}>₦{(doctor.consultationFee || doctor.consultation_fee || 0).toLocaleString()}</TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          {avgRating > 0 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <StarIcon sx={{ fontSize: 16, color: '#FFB400' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', fontSize: '0.85rem' }}>{avgRating.toFixed(1)}</Typography>
                              <Typography variant="caption" sx={{ color: '#7B809A' }}>({ratingCount})</Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ color: '#7B809A', fontSize: '0.85rem' }}>No ratings</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip label={doctor.isAvailable !== false ? 'Active' : 'Inactive'} size="small" color={doctor.isAvailable !== false ? 'success' : 'default'} sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Change Photo"><IconButton size="small" sx={{ color: '#9C27B0' }} onClick={() => handleOpenImageUpload(doctor)}><PhotoCameraIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Edit"><IconButton size="small" sx={{ color: '#1A73E8' }} onClick={() => handleOpenEdit(doctor)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Delete"><IconButton size="small" sx={{ color: '#F44336' }} onClick={() => handleDelete(doctor)} disabled={actionLoading}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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
            {editMode ? 'Edit Doctor' : 'Add New Doctor'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {formError && <Alert severity="error" sx={{ borderRadius: 2 }}>{formError}</Alert>}
              <TextField label="Full Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <TextField label="Email" type="email" fullWidth value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Phone" fullWidth value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                {!editMode && <TextField label="Password" type="password" fullWidth value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />}
                {editMode && <TextField label="New Password (leave blank to keep)" type="password" fullWidth value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />}
              </Box>
              <FormControl fullWidth>
                <InputLabel>Specialty</InputLabel>
                <Select value={formData.specialty} label="Specialty" onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}>
                  <MenuItem value="">Select Specialty</MenuItem>
                  {specialties.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Qualification" fullWidth value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Experience (years)" type="number" fullWidth value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} inputProps={{ min: 0 }} />
                <TextField label="Consultation Fee (₦)" type="number" fullWidth value={formData.consultationFee} onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })} inputProps={{ min: 0 }} />
              </Box>
              <TextField label="Bio" fullWidth multiline rows={3} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
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
          entity={imageDialogDoctor}
          entityId={imageDialogDoctor?._id || imageDialogDoctor?.id}
          updateEndpoint={`/admin/doctors/${imageDialogDoctor?._id || imageDialogDoctor?.id}`}
          onSuccess={handleImageUploadSuccess}
          entityName={imageDialogDoctor ? getDoctorName(imageDialogDoctor) : 'Doctor'}
        />
      </Box>
    </DashboardLayout>
  );
};

export default DoctorsManagementPage;
