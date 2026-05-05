import React, { useEffect, useState, useCallback } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Avatar, List, ListItem, ListItemText,
  ListItemIcon, Divider, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Skeleton, Button
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DashboardLayout from '../../../layout/MaterialDashboard/DashboardLayout';
import ReportsLineChart from '../../../components/Dashboard/ReportsLineChart';
import ReportsBarChart from '../../../components/Dashboard/ReportsBarChart';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments, fetchDashboardStats } from '../../appointments/store/appointmentSlice';
import { fetchDoctors } from '../../doctors/store/doctorSlice';
import api from '../../../shared/services/api';

const gradients = {
  primary: 'linear-gradient(195deg, #EC407A 0%, #D81B60 100%)',
  success: 'linear-gradient(195deg, #66BB6A 0%, #43A047 100%)',
  info: 'linear-gradient(195deg, #1A73E8 0%, #4285F4 100%)',
  warning: 'linear-gradient(195deg, #FFB74D 0%, #FB8C00 100%)',
  error: 'linear-gradient(195deg, #EF5350 0%, #E53935 100%)',
  dark: 'linear-gradient(195deg, #42424A 0%, #191919 100%)',
};

const StatCard = ({ icon, gradient, title, count, percentageValue, percentageColor }) => (
  <Card sx={{ borderRadius: 1, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, px: 2 }}>
      <Box
        sx={{
          width: '4rem',
          height: '4rem',
          borderRadius: '1rem',
          background: gradients[gradient] || gradients.info,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 20px 0 rgba(0,0,0,0.14)`,
          mt: -3,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ textAlign: 'right', lineHeight: 1.25 }}>
        <Typography variant="button" sx={{ color: '#7B809A', fontWeight: 400, fontSize: '0.8rem', textTransform: 'uppercase' }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#344767' }}>
          {count}
        </Typography>
      </Box>
    </Box>
    <Divider sx={{ mx: 2 }} />
    <Box sx={{ pb: 2, px: 2, pt: 1 }}>
      <Typography variant="button" sx={{ color: '#7B809A', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
        <Box
          component="span"
          sx={{
            fontWeight: 700,
            color: percentageColor === 'success' ? '#4CAF50' : '#F44336',
            mr: 0.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {percentageValue}
        </Box>
      </Typography>
    </Box>
  </Card>
);

const StatCardSkeleton = () => (
  <Card sx={{ borderRadius: 1, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)', p: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Skeleton variant="rectangular" width={56} height={56} sx={{ borderRadius: 2 }} />
      <Box sx={{ textAlign: 'right' }}>
        <Skeleton variant="text" width={80} height={20} />
        <Skeleton variant="text" width={60} height={32} />
      </Box>
    </Box>
    <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
  </Card>
);

const DashboardPage = () => {
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
        <Box sx={{ py: 3 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map(i => <Grid item xs={12} md={6} lg={3} key={i}><StatCardSkeleton /></Grid>)}
          </Grid>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            {[1, 2, 3].map(i => <Grid item xs={12} md={6} lg={4} key={i}><Skeleton variant="rectangular" sx={{ borderRadius: 1, height: 310 }} /></Grid>)}
          </Grid>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6} lg={8}><Skeleton variant="rectangular" sx={{ borderRadius: 1, height: 400 }} /></Grid>
            <Grid item xs={12} md={6} lg={4}><Skeleton variant="rectangular" sx={{ borderRadius: 1, height: 400 }} /></Grid>
          </Grid>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ py: 3 }}>
        {/* Stat Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              icon={<EventNoteIcon sx={{ fontSize: 28, color: '#fff' }} />}
              gradient="info"
              title="Total Appointments"
              count={totalAppointments}
              percentageValue={`${pendingPercent}%`}
              percentageColor="success"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              icon={<AttachMoneyIcon sx={{ fontSize: 28, color: '#fff' }} />}
              gradient="success"
              title="Total Revenue"
              count={`₦${totalRevenue.toLocaleString()}`}
              percentageValue="+5%"
              percentageColor="success"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              icon={<ScheduleIcon sx={{ fontSize: 28, color: '#fff' }} />}
              gradient="warning"
              title="Pending"
              count={pendingAppointments}
              percentageValue={`${pendingAppointments}`}
              percentageColor={pendingAppointments > 10 ? 'error' : 'success'}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              icon={<CheckCircleIcon sx={{ fontSize: 28, color: '#fff' }} />}
              gradient="error"
              title="Completed"
              count={completedAppointments}
              percentageValue={`${completedPercent}%`}
              percentageColor="success"
            />
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6} lg={4}>
            <ReportsBarChart
              title="Weekly Revenue"
              description="Last 7 days performance"
              color="info"
              data={{ labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [4500, 5200, 4800, 6100, 5500, 3200, 2800] }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <ReportsLineChart
              title="Monthly Appointments"
              description="(+15%) increase this month"
              color="success"
              data={{ labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], values: [50, 40, 300, 220, 500, 250, 400, 230, 500] }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <ReportsLineChart
              title="Completed Tasks"
              description="Last campaign performance"
              color="dark"
              data={{ labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], values: [120, 180, 250, 320, 280, 400, 450] }}
            />
          </Grid>
        </Grid>

        {/* Projects Table & Overview */}
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          {/* Projects Table */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 1, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: '1rem 1.5rem 0.5rem' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      Appointment Tracking
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4CAF50' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', fontSize: '0.875rem' }}>
                        <Box component="span" sx={{ fontWeight: 700 }}>{completedAppointments}</Box> done this month
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    endIcon={<ArrowUpwardIcon sx={{ fontSize: 16 }} />}
                    onClick={() => window.location.href = '/dashboard/appointments'}
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
                      color: '#fff',
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
              </CardContent>
              <TableContainer sx={{ overflow: 'auto', maxHeight: 350 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#7B809A', fontWeight: 600, fontSize: '0.65rem', py: 1, borderBottom: '1px solid #e5e5e5', letterSpacing: '0.5px' }}>PATIENT</TableCell>
                      <TableCell sx={{ color: '#7B809A', fontWeight: 600, fontSize: '0.65rem', py: 1, borderBottom: '1px solid #e5e5e5', letterSpacing: '0.5px' }}>DOCTOR</TableCell>
                      <TableCell sx={{ color: '#7B809A', fontWeight: 600, fontSize: '0.65rem', py: 1, borderBottom: '1px solid #e5e5e5', letterSpacing: '0.5px' }}>DATE</TableCell>
                      <TableCell sx={{ color: '#7B809A', fontWeight: 600, fontSize: '0.65rem', py: 1, borderBottom: '1px solid #e5e5e5', letterSpacing: '0.5px' }}>STATUS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.slice(0, 7).map((apt) => {
                      const statusColors = {
                        completed: '#4CAF50',
                        pending: '#FB8C00',
                        cancelled: '#F44336',
                        confirmed: '#1A73E8',
                        in_progress: '#9C27B0',
                      };
                      const statusBg = {
                        completed: '#e8f5e9',
                        pending: '#fff3e0',
                        cancelled: '#ffebee',
                        confirmed: '#e3f2fd',
                        in_progress: '#f3e5f5',
                      };
                      const statusLabel = getStatusLabel(apt.status);
                      return (
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
                          <TableCell sx={{ py: 1.25, borderBottom: '1px solid #f0f0f0' }}>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1,
                                py: 0.35,
                                borderRadius: 1,
                                bgcolor: statusBg[apt.status] || '#f5f5f5',
                              }}
                            >
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColors[apt.status] || '#9E9E9E' }} />
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: statusColors[apt.status] || '#9E9E9E' }}>
                                {statusLabel}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          {/* Clinic Overview */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 1, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: '1rem 1.5rem 0.5rem' }}>
                <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                  Clinic Overview
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FB8C00' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', fontSize: '0.875rem' }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>{pendingAppointments}</Box> pending items
                  </Typography>
                </Box>
                <Divider sx={{ mb: 1 }} />
              </CardContent>
              <List disablePadding dense sx={{ px: 1.5, pb: 1.5 }}>
                {[
                  { icon: <PeopleIcon sx={{ fontSize: 16, color: '#fff' }} />, bg: 'linear-gradient(195deg, #49A3B8 0%, #1A73E8 100%)', label: 'Total Doctors', value: totalDoctors, path: '/dashboard/doctors' },
                  { icon: <PersonIcon sx={{ fontSize: 16, color: '#fff' }} />, bg: 'linear-gradient(195deg, #66BB6A 0%, #43A047 100%)', label: 'Total Patients', value: totalPatients, path: '/dashboard/patients' },
                  { icon: <LocalHospitalIcon sx={{ fontSize: 16, color: '#fff' }} />, bg: 'linear-gradient(195deg, #FFB74D 0%, #FB8C00 100%)', label: 'Medical Services', value: totalServices, path: '/dashboard/services' },
                  { icon: <ScheduleIcon sx={{ fontSize: 16, color: '#fff' }} />, bg: 'linear-gradient(195deg, #EC407A 0%, #D81B60 100%)', label: 'Pending', value: pendingAppointments, path: '/dashboard/appointments' },
                  { icon: <CheckCircleIcon sx={{ fontSize: 16, color: '#fff' }} />, bg: 'linear-gradient(195deg, #EF5350 0%, #E53935 100%)', label: 'Completed', value: completedAppointments, path: '/dashboard/appointments' },
                ].map((item, idx) => (
                  <React.Fragment key={item.label}>
                    <ListItem
                      sx={{ px: 0, py: 1.25, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
                      onClick={() => window.location.href = item.path}
                    >
                      <ListItemIcon sx={{ minWidth: 44 }}>
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
                    {idx < 4 && <Divider sx={{ mx: 0 }} />}
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;
