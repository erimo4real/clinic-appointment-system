import React, { useState, useEffect, useCallback } from 'react';
import { AppBar, Toolbar, IconButton, Typography, InputBase, Box, Avatar, Badge, Menu, MenuItem, Divider, List, ListItem, ListItemText, ListItemIcon, Tooltip, Paper } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/store/authSlice';
import { useNavigate } from 'react-router-dom';
import api from '../../shared/services/api';

const Navbar = ({ onMenuToggle }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNotifOpen = (event) => {
    setNotifAnchor(event.currentTarget);
    fetchNotifications();
  };
  const handleNotifClose = () => setNotifAnchor(null);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDeleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

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

  const getNotifIcon = (type) => {
    switch (type) {
      case 'appointment': return '📅';
      case 'feedback': return '💬';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getNotifTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'transparent', backdropFilter: 'none', px: { xs: 2, md: 3 }, py: 1 }}>
      <Toolbar disableGutters>
        <IconButton onClick={onMenuToggle} sx={{ mr: 2, display: { md: 'none' }, color: '#344767' }}>
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

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, backgroundColor: '#fff', borderRadius: 2, px: 2, py: 0.5, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <SearchIcon sx={{ color: '#7B809A', fontSize: 20 }} />
          <InputBase placeholder="Type here..." sx={{ fontSize: '0.875rem', color: '#344767', width: 200 }} />
        </Box>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton sx={{ color: '#7B809A', ml: 2 }} onClick={handleNotifOpen}>
            <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Settings */}
        <Tooltip title="Settings">
          <IconButton sx={{ color: '#7B809A' }} onClick={() => navigate('/dashboard/settings')}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>

        {/* User Menu */}
        <Box onClick={handleMenuOpen} sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, cursor: 'pointer', p: 0.5, borderRadius: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
          <Typography variant="body2" sx={{ color: '#344767', fontWeight: 600, fontSize: '0.85rem' }}>
            {user?.firstName || user?.username || 'User'}
          </Typography>
          <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg, #1A73E8 0%, #4285F4 100%)', fontSize: 12, fontWeight: 600 }}>
            {user?.profileImage ? (
              <img src={user.profileImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : getInitials()}
          </Avatar>
        </Box>

        {/* User Dropdown */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { mt: 1.5, minWidth: 180, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } }}>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard/profile'); }}>
            Profile
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard/settings'); }}>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: '#F44335' }}>
            Sign Out
          </MenuItem>
        </Menu>

        {/* Notifications Dropdown */}
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleNotifClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              width: { xs: 320, sm: 380 },
              maxHeight: 480,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              borderRadius: 2,
            },
            style: { overflow: 'visible' },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#344767' }}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </Typography>
            {unreadCount > 0 && (
              <IconButton size="small" onClick={handleMarkAllRead} sx={{ color: '#1A73E8' }}>
                <MarkEmailReadIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Divider />
          <List sx={{ p: 0, maxHeight: 380, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#7B809A' }}>No notifications</Typography>
              </Box>
            ) : (
              notifications.map((notif) => (
                <ListItem
                  key={notif._id}
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: notif.isRead ? 'transparent' : '#f0f7ff',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                  onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                >
                  <ListItemIcon sx={{ minWidth: 40, fontSize: '1.2rem' }}>
                    {getNotifIcon(notif.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: notif.isRead ? 400 : 600, color: '#344767', fontSize: '0.85rem' }}>
                        {notif.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ color: '#7B809A', fontSize: '0.8rem', mt: 0.25 }}>
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#aaa', fontSize: '0.7rem', mt: 0.25, display: 'block' }}>
                          {getNotifTime(notif.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteNotif(notif._id); }} sx={{ color: '#ccc', '&:hover': { color: '#F44335' } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItem>
              ))
            )}
          </List>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
