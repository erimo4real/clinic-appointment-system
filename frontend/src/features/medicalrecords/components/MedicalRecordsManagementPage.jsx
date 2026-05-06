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
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../../shared/services/api';
import { useSelector } from 'react-redux';
import { useToast } from '../../../components/ui/Toast';

const sanitize = (str) => typeof str === 'string' ? str.trim().replace(/[<>]/g, '') : str;

const MedicalRecordsManagementPage = () => {
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient: '', doctor: '', appointment: '', chiefComplaint: '', diagnosis: '',
    symptoms: '', treatment: '', notes: '', followUpDate: '',
    bloodPressure: '', heartRate: '', temperature: '', weight: '', height: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [recRes, patientsRes, doctorsRes] = await Promise.all([
        api.get('/medical-records'),
        (user?.role === 'admin') ? api.get('/admin/users').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        api.get('/doctors').catch(() => ({ data: [] })),
      ]);
      setRecords(Array.isArray(recRes.data) ? recRes.data : []);
      setPatients(Array.isArray(patientsRes.data) ? patientsRes.data.filter(u => u.role === 'patient') : []);
      setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
    } catch {
      toast.error('Failed to load medical records');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user?.role]);

  const filtered = useMemo(() => {
    return records.filter(r => {
      const patientName = r.patient?.firstName ? `${r.patient.firstName} ${r.patient.lastName}` : '';
      const doctorName = r.doctor?.name || (r.doctor?.user?.firstName ? `Dr. ${r.doctor.user.firstName}` : '');
      const matchSearch = `${patientName} ${doctorName} ${r.diagnosis || ''} ${r.chiefComplaint || ''}`.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [records, search]);

  const getPatientName = (r) => {
    if (r.patient) return `${r.patient.firstName || ''} ${r.patient.lastName || ''}`.trim() || r.patient.username;
    return 'N/A';
  };

  const getDoctorName = (r) => {
    if (r.doctor) {
      if (r.doctor.name) return `Dr. ${r.doctor.name}`;
      if (r.doctor.user) return `Dr. ${r.doctor.user.firstName || ''} ${r.doctor.user.lastName || ''}`.trim();
    }
    return 'N/A';
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setViewMode(false);
    setSelectedRecord(null);
    setFormData({
      patient: '', doctor: '', appointment: '', chiefComplaint: '', diagnosis: '',
      symptoms: '', treatment: '', notes: '', followUpDate: '',
      bloodPressure: '', heartRate: '', temperature: '', weight: '', height: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (record) => {
    setEditMode(true);
    setViewMode(false);
    setSelectedRecord(record);
    setFormData({
      patient: record.patient?._id || record.patient || '',
      doctor: record.doctor?._id || record.doctor || '',
      chiefComplaint: record.chiefComplaint || '',
      diagnosis: record.diagnosis || '',
      symptoms: Array.isArray(record.symptoms) ? record.symptoms.join(', ') : '',
      treatment: record.treatment || '',
      notes: record.notes || '',
      followUpDate: record.followUpDate ? new Date(record.followUpDate).toISOString().split('T')[0] : '',
      bloodPressure: record.vitalSigns?.bloodPressure || '',
      heartRate: record.vitalSigns?.heartRate || '',
      temperature: record.vitalSigns?.temperature || '',
      weight: record.vitalSigns?.weight || '',
      height: record.vitalSigns?.height || '',
    });
    setOpenDialog(true);
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setViewMode(true);
    setEditMode(false);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.chiefComplaint.trim()) { toast.error('Chief complaint is required'); return; }
    if (!formData.diagnosis.trim()) { toast.error('Diagnosis is required'); return; }
    setActionLoading(true);
    try {
      const payload = {
        chiefComplaint: sanitize(formData.chiefComplaint),
        diagnosis: sanitize(formData.diagnosis),
        symptoms: formData.symptoms.split(',').map(s => sanitize(s.trim())).filter(Boolean),
        treatment: sanitize(formData.treatment),
        notes: sanitize(formData.notes),
        followUpDate: formData.followUpDate || undefined,
        vitalSigns: {
          bloodPressure: sanitize(formData.bloodPressure),
          heartRate: sanitize(formData.heartRate),
          temperature: sanitize(formData.temperature),
          weight: sanitize(formData.weight),
          height: sanitize(formData.height),
        },
      };
      if (!editMode) {
        if (!formData.patient) { toast.error('Patient is required'); setActionLoading(false); return; }
        payload.patient = formData.patient;
        if (!formData.doctor) { toast.error('Doctor is required'); setActionLoading(false); return; }
        payload.doctor = formData.doctor;
        await api.post('/medical-records', payload);
        toast.success('Medical record created');
      } else {
        await api.put(`/medical-records/${selectedRecord._id || selectedRecord.id}`, payload);
        toast.success('Medical record updated');
      }
      await loadData();
      setOpenDialog(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
    setActionLoading(false);
  };

  const handleDelete = async (record) => {
    if (!window.confirm('Delete this medical record?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/medical-records/${record._id || record.id}`);
      await loadData();
      toast.success('Medical record deleted');
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
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767' }}>Medical Records</Typography>
            <Typography variant="body2" sx={{ color: '#7B809A' }}>{records.length} total records</Typography>
          </Box>
          {(user?.role === 'doctor' || user?.role === 'admin') && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
              New Record
            </Button>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            placeholder="Search records..."
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
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>PATIENT</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>DOCTOR</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>DIAGNOSIS</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>VISIT DATE</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>FOLLOW-UP</TableCell>
                    <TableCell sx={{ color: '#7B809A', fontWeight: 700, fontSize: '0.65rem', py: 1.5, bgcolor: '#fafafa', letterSpacing: '0.5px' }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#7B809A' }}>No records found</TableCell></TableRow>
                  ) : filtered.map((record) => (
                    <TableRow key={record._id || record.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                      <TableCell sx={{ py: 1.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#4CAF50', fontSize: 12, fontWeight: 600 }}>
                            {(getPatientName(record) || 'P')[0].toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', fontSize: '0.85rem' }}>
                            {getPatientName(record)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#7B809A', fontSize: '0.85rem', py: 1.25 }}>{getDoctorName(record)}</TableCell>
                      <TableCell sx={{ color: '#344767', fontSize: '0.85rem', py: 1.25, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {record.diagnosis || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: '#7B809A', fontSize: '0.85rem', py: 1.25 }}>
                        {record.visitDate ? new Date(record.visitDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ py: 1.25 }}>
                        {record.followUpDate ? (
                          <Chip label={new Date(record.followUpDate).toLocaleDateString()} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1A73E8', fontWeight: 600 }} />
                        ) : (
                          <Typography variant="body2" sx={{ color: '#7B809A' }}>None</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 1.25 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View">
                            <IconButton size="small" sx={{ color: '#7B809A' }} onClick={() => handleView(record)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {(user?.role === 'doctor' || user?.role === 'admin') && (
                            <Tooltip title="Edit">
                              <IconButton size="small" sx={{ color: '#1A73E8' }} onClick={() => handleOpenEdit(record)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {user?.role === 'admin' && (
                            <Tooltip title="Delete">
                              <IconButton size="small" sx={{ color: '#F44336' }} onClick={() => handleDelete(record)} disabled={actionLoading}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, color: '#344767' }}>
            {viewMode ? 'Medical Record Details' : editMode ? 'Edit Record' : 'New Medical Record'}
          </DialogTitle>
          <DialogContent dividers>
            {viewMode && selectedRecord ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  {[
                    ['Patient', getPatientName(selectedRecord)],
                    ['Doctor', getDoctorName(selectedRecord)],
                    ['Visit Date', selectedRecord.visitDate ? new Date(selectedRecord.visitDate).toLocaleDateString() : 'N/A'],
                    ['Follow-Up', selectedRecord.followUpDate ? new Date(selectedRecord.followUpDate).toLocaleDateString() : 'None'],
                  ].map(([label, value]) => (
                    <Box key={label}>
                      <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>{label}</Typography>
                      <Typography variant="body2" sx={{ color: '#344767', fontWeight: 500 }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Chief Complaint</Typography>
                  <Typography variant="body2" sx={{ color: '#344767', mt: 0.5 }}>{selectedRecord.chiefComplaint}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Diagnosis</Typography>
                  <Typography variant="body2" sx={{ color: '#344767', mt: 0.5 }}>{selectedRecord.diagnosis}</Typography>
                </Box>
                {selectedRecord.symptoms?.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Symptoms</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {selectedRecord.symptoms.map((s, i) => (
                        <Chip key={i} label={s} size="small" sx={{ bgcolor: '#f0f2f5', color: '#344767' }} />
                      ))}
                    </Box>
                  </Box>
                )}
                {selectedRecord.vitalSigns && Object.values(selectedRecord.vitalSigns).some(v => v) && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Vital Signs</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 0.5 }}>
                      {selectedRecord.vitalSigns.bloodPressure && <Box><Typography variant="caption">BP:</Typography> <Typography variant="body2">{selectedRecord.vitalSigns.bloodPressure}</Typography></Box>}
                      {selectedRecord.vitalSigns.heartRate && <Box><Typography variant="caption">Heart Rate:</Typography> <Typography variant="body2">{selectedRecord.vitalSigns.heartRate}</Typography></Box>}
                      {selectedRecord.vitalSigns.temperature && <Box><Typography variant="caption">Temperature:</Typography> <Typography variant="body2">{selectedRecord.vitalSigns.temperature}</Typography></Box>}
                      {selectedRecord.vitalSigns.weight && <Box><Typography variant="caption">Weight:</Typography> <Typography variant="body2">{selectedRecord.vitalSigns.weight}</Typography></Box>}
                      {selectedRecord.vitalSigns.height && <Box><Typography variant="caption">Height:</Typography> <Typography variant="body2">{selectedRecord.vitalSigns.height}</Typography></Box>}
                    </Box>
                  </Box>
                )}
                {selectedRecord.treatment && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Treatment</Typography>
                    <Typography variant="body2" sx={{ color: '#344767', mt: 0.5 }}>{selectedRecord.treatment}</Typography>
                  </Box>
                )}
                {selectedRecord.notes && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>Notes</Typography>
                    <Typography variant="body2" sx={{ color: '#344767', mt: 0.5 }}>{selectedRecord.notes}</Typography>
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
                <TextField label="Chief Complaint" fullWidth required value={formData.chiefComplaint} onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })} />
                <TextField label="Diagnosis" fullWidth required value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} />
                <TextField label="Symptoms (comma separated)" fullWidth value={formData.symptoms} onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })} />
                <TextField label="Treatment" fullWidth multiline rows={2} value={formData.treatment} onChange={(e) => setFormData({ ...formData, treatment: e.target.value })} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#344767', mb: 1 }}>Vital Signs</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField label="Blood Pressure" size="small" fullWidth value={formData.bloodPressure} onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })} placeholder="e.g. 120/80" />
                    <TextField label="Heart Rate" size="small" fullWidth value={formData.heartRate} onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })} placeholder="e.g. 72 bpm" />
                    <TextField label="Temperature" size="small" fullWidth value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} placeholder="e.g. 98.6°F" />
                    <TextField label="Weight" size="small" fullWidth value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} placeholder="e.g. 70 kg" />
                    <TextField label="Height" size="small" fullWidth value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} placeholder="e.g. 175 cm" />
                  </Box>
                </Box>
                <TextField label="Notes" multiline rows={2} fullWidth value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                <TextField label="Follow-Up Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.followUpDate} onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })} />
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

export default MedicalRecordsManagementPage;
