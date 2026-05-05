import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, Avatar, useMediaQuery, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/auth/store/authSlice';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'doctor', 'patient', 'receptionist'] },
  { text: 'Appointments', icon: <EventNoteIcon />, path: '/dashboard/appointments', roles: ['admin', 'doctor', 'patient', 'receptionist'] },
  { text: 'Doctors', icon: <PeopleIcon />, path: '/dashboard/doctors', roles: ['admin', 'receptionist'] },
  { text: 'Patients', icon: <PeopleIcon />, path: '/dashboard/patients', roles: ['admin', 'doctor', 'receptionist'] },
  { text: 'Services', icon: <MedicalServicesIcon />, path: '/dashboard/services', roles: ['admin', 'receptionist'] },
  { text: 'Prescriptions', icon: <LocalHospitalIcon />, path: '/dashboard/prescriptions', roles: ['admin', 'doctor'] },
];

const Sidenav = ({ open, setOpen }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return 'U';
    const first = (user.firstName || user.username || '')[0] || '';
    const last = (user.lastName || '')[0] || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const filteredItems = menuItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, minHeight: 64 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #1A73E8 0%, #4285F4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MedicalServicesIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767', fontSize: '1rem' }}>
            MedBook Pro
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setOpen(false)}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      <Box sx={{ px: 2, py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.2 }}>
        {user?.profileImage ? (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid',
              borderColor: '#1A73E8',
              boxShadow: '0 2px 8px rgba(26,115,232,0.2)',
            }}
          >
            <img
              src={user.profileImage}
              alt="User"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        ) : (
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, #1A73E8 0%, #4285F4 100%)',
              fontSize: 20,
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(26,115,232,0.2)',
            }}
          >
            {getInitials()}
          </Avatar>
        )}
        <Box sx={{ textAlign: 'center', minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#344767', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#7B809A', textTransform: 'capitalize', fontSize: '0.7rem', fontWeight: 500 }}>
            {user?.role || 'patient'}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 2, py: 1, flex: 1 }}>
        {filteredItems.map((item, index) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => isMobile && setOpen(false)}
                sx={{
                  borderRadius: 2,
                  minHeight: 40,
                  px: 1.5,
                  py: 0.75,
                  backgroundColor: isActive ? '#e3f2fd' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive ? '#e3f2fd' : '#f5f5f5',
                  },
                  '& .MuiListItemIcon-root': {
                    color: isActive ? '#1A73E8' : '#7B809A',
                    minWidth: 40,
                  },
                  '& .MuiListItemText-primary': {
                    color: isActive ? '#1A73E8' : '#7B809A',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.875rem',
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ px: 2, pb: 2, pt: 1 }}>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                minHeight: 40,
                px: 1.5,
                py: 0.75,
                '&:hover': {
                  backgroundColor: '#fce4ec',
                },
                '& .MuiListItemIcon-root': {
                  color: '#F44335',
                  minWidth: 40,
                },
                '& .MuiListItemText-primary': {
                  color: '#F44335',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                },
              }}
            >
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMount: false }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              height: '100vh',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: open ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            height: '100vh',
            '& .MuiDrawer-paper': {
              width: open ? DRAWER_WIDTH : 0,
              boxSizing: 'border-box',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidenav;
