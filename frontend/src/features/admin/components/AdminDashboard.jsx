import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Avatar, List, ListItem, ListItemText,
  ListItemIcon, Divider, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Skeleton, IconButton, Button, LinearProgress
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DoneIcon from '@mui/icons-material/Done';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layout/MaterialDashboard/DashboardLayout';
import ReportsLineChart from '../../../components/Dashboard/ReportsLineChart';
import ReportsBarChart from '../../../components/Dashboard/ReportsBarChart';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments, fetchDashboardStats } from '../../appointments/store/appointmentSlice';
import { fetchDoctors } from '../../doctors/store/doctorSlice';
import api from '../../../shared/services/api';

const MetricCard = ({ icon, gradient, title, count, percentageValue, percentageColor, footerText }) => {
  const gradients = {
    primary: 'linear-gradient(195deg, #EC407A 0%, #D81B60 100%)',
    secondary: 'linear-gradient(195deg, #7B809A 0%, #49A3B8 100%)',
    success: 'linear-gradient(195deg, #66BB6A 0%, #43A047 100%)',
    info: 'linear-gradient(195deg, #1A73E8 0%, #4285F4 100%)',
    warning: 'linear-gradient(195deg, #FFB74D 0%, #FB8C00 100%)',
    error: 'linear-gradient(195deg, #EF5350 0%, #E53935 100%)',
    dark: 'linear-gradient(195deg, #42424A 0%, #191919 100%)',
  };
  const bg = gradient || gradients.info;
  const isUp = percentageColor === 'success';

  return (
    <Card sx={{
      borderRadius: 1,
      boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)',
      position: 'relative',
      overflow: 'visible',
      px: 2,
      pt: 3,
      pb: 2,
    }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 1.5,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14)',
          position: 'absolute',
          top: -20,
          right: 16,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ mt: 1.5 }}>
        <Typography sx={{ color: '#7B809A', fontSize: '0.875rem', fontWeight: 400 }}>
          {title}
        </Typography>
        <Typography sx={{ fontWeight: 700, color: '#344767', fontSize: '2rem', lineHeight: 1.25, mt: 0.5 }}>
          {count}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', color: percentageColor === 'success' ? '#4CAF50' : '#F44336' }}>
          {isUp ? <ArrowUpwardIcon sx={{ fontSize: 14 }} /> : <ArrowDownwardIcon sx={{ fontSize: 14 }} />}
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: percentageColor === 'success' ? '#4CAF50' : '#F44336', ml: 0.25 }}>
            {percentageValue}
          </Typography>
        </Box>
        <Typography sx={{ color: '#7B809A', fontSize: '0.875rem' }}>
          &nbsp;{footerText}
        </Typography>
      </Box>
    </Card>
  );
};

const MetricCardSkeleton = () => (
  <Card sx={{ borderRadius: 1, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)', position: 'relative', overflow: 'visible', px: 2, pt: 3, pb: 2 }}>
    <Skeleton variant="rectangular" width={56} height={56} sx={{ borderRadius: 1.5, position: 'absolute', top: -20, right: 16 }} />
    <Box sx={{ mt: 1.5 }}>
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="text" width="40%" height={40} />
    </Box>
    <Skeleton variant="text" width="50%" height={20} sx={{ mt: 2 }} />
  </Card>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { appointments, stats, loadingAppointments, loadingStats } = useSelector((state) => state.appointments);
  const { doctors, loading: docLoading } = useSelector((state) => state.doctors);
  const [services, setServices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        dispatch(fetchAppointments()),
        dispatch(fetchDashboardStats()),
        dispatch(fetchDoctors()),
        api.get('/services').then(res => setServices(Array.isArray(res.data) ? res.data : [])).catch(() => {}),
        (user?.role === 'admin' || user?.role === 'receptionist')
          ? api.get('/admin/users').then(res => setPatients(Array.isArray(res.data) ? res.data.filter(u => u.role === 'patient') : [])).catch(() => {})
          : Promise.resolve(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [dispatch, user?.role]);

  const totalAppointments = stats?.totalAppointments || appointments.length;
  const pendingAppointments = stats?.pendingAppointments || appointments.filter(a => a.status === 'pending').length;
  const completedAppointments = stats?.completedAppointments || appointments.filter(a => a.status === 'completed').length;
  const totalRevenue = stats?.totalRevenue || appointments.filter(a => a.status === 'completed').reduce((sum, a) => sum + (a.totalPrice || a.price || 0), 0);
  const totalDoctors = doctors.length;
  const totalPatients = patients.length || (user?.role === 'patient' ? 1 : 0);
  const totalServices = services.length;

  const pendingPercent = totalAppointments > 0 ? Math.round((pendingAppointments / totalAppointments) * 100) : 0;
  const completedPercent = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FB8C00';
      case 'cancelled': return '#F44336';
      case 'confirmed': return '#1A73E8';
      default: return '#9E9E9E';
    }
  }, []);

  const getStatusProgress = useCallback((status) => {
    switch (status) {
      case 'completed': return 100;
      case 'in_progress': return 60;
      case 'confirmed': return 40;
      case 'pending': return 20;
      default: return 0;
    }
  }, []);

  const getStatusLabel = useCallback((status) => {
    switch (status) {
      case 'completed': return 'Done';
      case 'in_progress': return 'In Progress';
      case 'confirmed': return 'Approved';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return 'Scheduled';
    }
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          <Grid container spacing={3} sx={{ mb: 0 }}>
            {[1, 2, 3, 4].map(i => <Grid item xs={12} sm={6} xl={3} key={i}><MetricCardSkeleton /></Grid>)}
          </Grid>
          <Grid container spacing={3} sx={{ mb: 0, mt: 0.5 }}>
            <Grid item xs={12} xl={8}><Skeleton variant="rectangular" sx={{ borderRadius: 1, height: 350, mt: 2 }} /></Grid>
            <Grid item xs={12} xl={4}><Skeleton variant="rectangular" sx={{ borderRadius: 1, height: 350, mt: 2 }} /></Grid>
          </Grid>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} xl={8}><Skeleton variant="rectangular" sx={{ borderRadius: 1, height: 400 }} /></Grid>
            <Grid item xs={12} xl={4}><Skeleton variant="rectangular" sx={{ borderRadius: 1, height: 400 }} /></Grid>
          </Grid>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <Grid container spacing={3} sx={{ mb: 0 }}>
          <Grid item xs={12} sm={6} xl={3}>
            <MetricCard
              icon={<EventNoteIcon sx={{ fontSize: 24, color: '#fff' }} />}
              gradient="info"
              title="Total Appointments"
              count={totalAppointments}
              percentageValue={`${pendingPercent}%`}
              percentageColor="success"
              footerText="than last month"
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <MetricCard
              icon={<AttachMoneyIcon sx={{ fontSize: 24, color: '#fff' }} />}
              gradient="success"
              title="Total Revenue"
              count={`₦${totalRevenue.toLocaleString()}`}
              percentageValue="+5%"
              percentageColor="success"
              footerText="than last week"
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <MetricCard
              icon={<ScheduleIcon sx={{ fontSize: 24, color: '#fff' }} />}
              gradient="warning"
              title="Pending"
              count={pendingAppointments}
              percentageValue={`${pendingAppointments}`}
              percentageColor={pendingAppointments > 10 ? 'error' : 'success'}
              footerText="awaiting confirmation"
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <MetricCard
              icon={<CheckCircleIcon sx={{ fontSize: 24, color: '#fff' }} />}
              gradient="error"
              title="Completed"
              count={completedAppointments}
              percentageValue={`${completedPercent}%`}
              percentageColor="success"
              footerText="completion rate"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 0, mt: 0.5 }}>
          <Grid item xs={12} xl={8} sx={{ height: 350 }}>
            <ReportsLineChart data={{ labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], values: [50, 40, 300, 220, 500, 250, 400, 230, 500] }} />
          </Grid>
          <Grid item xs={12} xl={4} sx={{ height: 350 }}>
            <ReportsBarChart data={{ labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], values: [4500, 5200, 4800, 6100, 5500, 3200, 2800] }} />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 0.5, flex: 1, minHeight: 0 }}>
          <Grid item xs={12} xl={8} sx={{ height: '100%', display: 'flex' }}>
            <Card sx={{ borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column', width: '100%', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: '1.5rem 1.5rem 1rem', pb: '1rem !important', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#7B809A', mb: 0.5, fontSize: '0.875rem' }}>
                      Appointment Tracking
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#4CAF50' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', fontSize: '0.875rem' }}>
                        <Box component="span" sx={{ fontWeight: 700 }}>{completedAppointments}</Box> done this month
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    endIcon={<ArrowUpwardIcon sx={{ fontSize: 16 }} />}
                    onClick={() => navigate('/dashboard/appointments')}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.5px',
                      background: 'linear-gradient(195deg, #49A3B8 0%, #1A73E8 100%)',
                      boxShadow: '0 2px 12px 0 rgba(0,0,0,0.14)',
                      px: 3,
                      py: 0.75,
                      cursor: 'pointer',
                      '&:hover': {
                        background: 'linear-gradient(195deg, #1A73E8 0%, #49A3B8 100%)',
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.2)',
                      }
                    }}
                  >
                    View All
                  </Button>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 500 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#7B809A', fontWeight: 600, fontSize: '0.65rem', py: 1, borderBottom: '1px solid #e5e5e5', letterSpacing: '0.5px' }}>PATIENT</TableCell>
                        <TableCell sx={{ color: '#7B809A', fontWeight: 600, fontSize: '0.65rem', py: 1, borderBottom: '1px solid #e5e5e5', letterSpacing: '0.5px' }}>DOCTOR</TableCell>
                        <TableCell sx={{ color: '#7B809A', fontWeight: 600, fontSize: '0.65rem', py: 1, borderBottom: '1px solid #e5e5e5', letterSpacing: '0.5px' }}>DATE</TableCell>
                        <TableCell sx={{ color: '#7B809A', fontWeight: 600, fontSize: '0.65rem', py: 1, borderBottom: '1px solid #e5e5e5', letterSpacing: '0.5px' }}>STATUS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {appointments.slice(0, 7).map((apt) => (
                        <TableRow key={apt._id || apt.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                          <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f0f0f0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(195deg, #1A73E8 0%, #4285F4 100%)', fontSize: 12, fontWeight: 600, color: '#fff' }}>
                                {(apt.patient_name || 'P')[0].toUpperCase()}
                              </Avatar>
                              <Typography sx={{ fontWeight: 600, color: '#344767', fontSize: '0.875rem' }}>
                                {apt.patient_name || 'Unknown'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: '#7B809A', fontSize: '0.875rem', py: 1.25, borderBottom: '1px solid #f0f0f0' }}>
                            {apt.doctor_name || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: '#7B809A', fontSize: '0.875rem', py: 1.25, borderBottom: '1px solid #f0f0f0' }}>
                            {apt.date ? new Date(apt.date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f0f0f0', minWidth: 140 }}>
                            <Box sx={{ width: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <DoneIcon sx={{ fontSize: 14, color: getStatusColor(apt.status) }} />
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#7B809A' }}>
                                  {getStatusLabel(apt.status)}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={getStatusProgress(apt.status)}
                                sx={{
                                  height: 3,
                                  borderRadius: 1,
                                  bgcolor: '#e9ecef',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: getStatusColor(apt.status),
                                    borderRadius: 1,
                                  }
                                }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} xl={4} sx={{ height: '100%', display: 'flex' }}>
            <Card sx={{ borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column', width: '100%', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: '1.5rem 1.5rem 1rem', pb: '1rem !important', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ color: '#7B809A', mb: 0.5, fontSize: '0.875rem' }}>
                  Clinic Overview
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <NotificationsIcon sx={{ fontSize: 18, color: '#FB8C00' }} />
                  <Typography sx={{ fontWeight: 600, color: '#344767', fontSize: '0.875rem' }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>{pendingAppointments}</Box> pending items
                  </Typography>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <List disablePadding dense sx={{ flex: 1 }}>
                  {[
                    { icon: <PeopleIcon sx={{ fontSize: 18, color: '#fff' }} />, bg: 'linear-gradient(195deg, #49A3B8 0%, #1A73E8 100%)', label: 'Total Doctors', value: totalDoctors, path: '/dashboard/doctors' },
                    { icon: <PersonIcon sx={{ fontSize: 18, color: '#fff' }} />, bg: 'linear-gradient(195deg, #66BB6A 0%, #43A047 100%)', label: 'Total Patients', value: totalPatients, path: '/dashboard/patients' },
                    { icon: <LocalHospitalIcon sx={{ fontSize: 18, color: '#fff' }} />, bg: 'linear-gradient(195deg, #FFB74D 0%, #FB8C00 100%)', label: 'Medical Services', value: totalServices, path: '/dashboard/services' },
                    { icon: <ScheduleIcon sx={{ fontSize: 18, color: '#fff' }} />, bg: 'linear-gradient(195deg, #EC407A 0%, #D81B60 100%)', label: 'Pending', value: pendingAppointments, path: '/dashboard/appointments' },
                    { icon: <CheckCircleIcon sx={{ fontSize: 18, color: '#fff' }} />, bg: 'linear-gradient(195deg, #EF5350 0%, #E53935 100%)', label: 'Completed', value: completedAppointments, path: '/dashboard/appointments' },
                  ].map((item) => (
                    <ListItem
                      key={item.label}
                      sx={{ px: 0, py: 1, cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: '#f5f5f5' } }}
                      onClick={() => navigate(item.path)}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar sx={{ width: 32, height: 32, background: item.bg, borderRadius: 1.5, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14)' }}>
                          {item.icon}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.value}
                        primaryTypographyProps={{ sx: { fontWeight: 600, color: '#344767', fontSize: '0.875rem' } }}
                        secondaryTypographyProps={{ sx: { color: '#7B809A', fontWeight: 700, fontSize: '1rem' } }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;
