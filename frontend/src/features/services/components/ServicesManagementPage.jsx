import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServices } from '../../doctors/store/doctorSlice';
import DashboardLayout from '../../../layout/MaterialDashboard/DashboardLayout';
import {
  Card, CardContent, Typography, Box, Chip, Button, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  CircularProgress, Tooltip, InputAdornment
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimerIcon from '@mui/icons-material/Timer';
import api from '../../../shared/services/api';
import { useToast } from '../../../components/ui/Toast';

const sanitize = (str) => typeof str === 'string' ? str.trim().replace(/[<>]/g, '') : str;

const ServicesManagementPage = () => {
  const dispatch = useDispatch();
  const { services, loading } = useSelector((state) => state.doctors);
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', duration: 30, price: '', isActive: true });

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return services.filter(s => {
      const text = `${s.name || ''} ${s.description || ''}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [services, search]);

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedService(null);
    setFormData({ name: '', description: '', duration: 30, price: '', isActive: true });
    setOpenDialog(true);
  };

  const handleOpenEdit = (service) => {
    setEditMode(true);
    setSelectedService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      duration: service.duration || 30,
      price: service.price || '',
      isActive: service.isActive !== false,
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) { toast.error('Service name is required'); return; }
    if (!formData.price || parseFloat(formData.price) < 0) { toast.error('Valid price is required'); return; }
    if (formData.duration && parseInt(formData.duration) < 1) { toast.error('Duration must be at least 1 minute'); return; }
    setActionLoading(true);
    try {
      const payload = {
        name: sanitize(formData.name),
        description: sanitize(formData.description),
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration) || 30,
      };
      if (editMode) {
        payload.is_active = formData.isActive;
        await api.put(`/admin/services/${selectedService._id || selectedService.id}`, payload);
        toast.success('Service updated successfully');
      } else {
        payload.is_active = true;
        await api.post('/admin/services', payload);
        toast.success('Service created successfully');
      }
      dispatch(fetchServices());
      setOpenDialog(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
    setActionLoading(false);
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Delete "${service.name}"?`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/services/${service._id || service.id}`);
      dispatch(fetchServices());
      toast.success('Service deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
    setActionLoading(false);
  };

  const handleToggleActive = async (service) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/services/${service._id || service.id}`, { is_active: !service.isActive });
      dispatch(fetchServices());
      toast.success(`Service ${service.isActive ? 'deactivated' : 'activated'}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
    setActionLoading(false);
  };

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767' }}>Services</Typography>
            <Typography variant="body2" sx={{ color: '#7B809A' }}>{services.length} medical services</Typography>
          </Box>
          {(user?.role === 'admin' || user?.role === 'receptionist') && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
              Add Service
            </Button>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#7B809A' }} /></InputAdornment> }}
            size="small"
          />
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
          ) : filtered.length === 0 ? (
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <MedicalServicesIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#7B809A' }}>No services found</Typography>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>SERVICE</TableCell>
                      <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>DESCRIPTION</TableCell>
                      <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>DURATION</TableCell>
                      <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>PRICE</TableCell>
                      <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>STATUS</TableCell>
                      <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((service) => (
                      <TableRow key={service._id || service.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 40, height: 40, borderRadius: 2, background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <MedicalServicesIcon sx={{ color: '#1A73E8', fontSize: 20 }} />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767' }}>{service.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#7B809A', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', py: 1.25 }}>
                          {service.description || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TimerIcon sx={{ fontSize: 16, color: '#7B809A' }} />
                            <Typography variant="body2" sx={{ color: '#344767', fontSize: '0.85rem' }}>{service.duration} min</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#4CAF50', fontSize: '0.85rem', py: 1.25 }}>
                          ₦{(service.price || 0).toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Chip
                            label={service.isActive !== false ? 'Active' : 'Inactive'}
                            size="small"
                            color={service.isActive !== false ? 'success' : 'default'}
                            sx={{ fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                            onClick={() => handleToggleActive(service)}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.25 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Edit">
                              <IconButton size="small" sx={{ color: '#1A73E8' }} onClick={() => handleOpenEdit(service)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" sx={{ color: '#F44336' }} onClick={() => handleDelete(service)} disabled={actionLoading}>
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
          )}
        </Box>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: '#344767' }}>
            {editMode ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Service Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <TextField label="Description" fullWidth multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Duration (min)" type="number" fullWidth value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><TimerIcon sx={{ color: '#7B809A', fontSize: 20 }} /></InputAdornment> }} />
                <TextField label="Price (₦)" type="number" fullWidth value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required
                  InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon sx={{ color: '#7B809A', fontSize: 20 }} /></InputAdornment> }} />
              </Box>
              {editMode && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={formData.isActive ? 'Active' : 'Inactive'} color={formData.isActive ? 'success' : 'default'} size="small" />
                  <Button size="small" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                    Toggle Status
                  </Button>
                </Box>
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
      </Box>
    </DashboardLayout>
  );
};

export default ServicesManagementPage;
