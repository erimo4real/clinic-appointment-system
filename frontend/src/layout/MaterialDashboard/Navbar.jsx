import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, InputBase, Box, Avatar, Badge, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/store/authSlice';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuToggle }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'transparent',
        backdropFilter: 'none',
        px: { xs: 2, md: 3 },
        py: 1,
      }}
    >
      <Toolbar disableGutters>
        <IconButton
          onClick={onMenuToggle}
          sx={{ mr: 2, display: { md: 'none' }, color: '#344767' }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#7B809A', mb: 0.25 }}>
            {getGreeting()}, {user?.firstName || user?.username || 'User'}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#aaa' }}>
            {formatDate()}
          </Typography>
        </Box>

        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            gap: 1,
            backgroundColor: '#fff',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <SearchIcon sx={{ color: '#7B809A', fontSize: 20 }} />
          <InputBase
            placeholder="Type here..."
            sx={{ fontSize: '0.875rem', color: '#344767', width: 200 }}
          />
        </Box>

        <IconButton sx={{ color: '#7B809A', ml: 2 }}>
          <Badge badgeContent={0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <IconButton sx={{ color: '#7B809A' }}>
          <SettingsIcon />
        </IconButton>

        <Box
          onClick={handleMenuOpen}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, cursor: 'pointer', p: 0.5, borderRadius: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
        >
          <Typography variant="body2" sx={{ color: '#344767', fontWeight: 600, fontSize: '0.85rem' }}>
            {user?.firstName || user?.username || 'User'}
          </Typography>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #1A73E8 0%, #4285F4 100%)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {getInitials()}
          </Avatar>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 180,
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            },
          }}
        >
          <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard/settings'); }}>
            My Profile
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard/settings'); }}>
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: '#F44335' }}>
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
