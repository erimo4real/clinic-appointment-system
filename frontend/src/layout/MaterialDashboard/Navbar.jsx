import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppBar, Toolbar, IconButton, Typography, InputBase, Box, Avatar, Badge, Menu, MenuItem, Divider, List, ListItem, ListItemText, ListItemIcon, Tooltip, Paper } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SettingsIcon from '@mui/icons-material/Settings';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/store/authSlice';
import { useNavigate } from 'react-router-dom';
import api from '../../shared/services/api';

const searchIcons = {
  patient: <PeopleIcon sx={{ color: '#4CAF50', fontSize: 20 }} />,
  doctor: <PeopleIcon sx={{ color: '#1A73E8', fontSize: 20 }} />,
  appointment: <EventNoteIcon sx={{ color: '#FF9800', fontSize: 20 }} />,
  service: <MedicalServicesIcon sx={{ color: '#9C27B0', fontSize: 20 }} />,
};

const groupIcons = {
  patients: <PeopleIcon sx={{ color: '#4CAF50', fontSize: 16 }} />,
  doctors: <LocalHospitalIcon sx={{ color: '#1A73E8', fontSize: 16 }} />,
  appointments: <EventNoteIcon sx={{ color: '#FF9800', fontSize: 16 }} />,
  services: <MedicalServicesIcon sx={{ color: '#9C27B0', fontSize: 16 }} />,
};

const groupLabels = {
  patients: 'Patients',
  doctors: 'Doctors',
  appointments: 'Appointments',
  services: 'Services',
};

const Navbar = ({ onMenuToggle }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ patients: [], doctors: [], appointments: [], services: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults({ patients: [], doctors: [], appointments: [], services: [] });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults({ patients: [], doctors: [], appointments: [], services: [] });
      setSelectedIndex(-1);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      setSelectedIndex(-1);
      try {
        const res = await api.get('/search', { params: { q: searchQuery } });
        setSearchResults(res.data.results || { patients: [], doctors: [], appointments: [], services: [] });
      } catch (err) {
        console.error('Search error:', err);
      }
      setSearchLoading(false);
    }, 300);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

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

  const allResults = [
    ...searchResults.patients,
    ...searchResults.doctors,
    ...searchResults.appointments,
    ...searchResults.services,
  ];

  const handleResultClick = (result) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(result.route);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : allResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < allResults.length) {
        handleResultClick(allResults[selectedIndex]);
      }
    }
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

        {/* Global Search */}
        <Box sx={{ position: 'relative' }} ref={searchRef}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, backgroundColor: '#fff', borderRadius: 2, px: 2, py: 0.5, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', width: 260, transition: 'all 0.2s', ...(searchOpen ? { width: 380, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : {}) }}>
            <SearchIcon sx={{ color: '#7B809A', fontSize: 20 }} />
            <InputBase
              inputRef={searchInputRef}
              placeholder="Search patients, doctors..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onKeyDown={handleSearchKeyDown}
              sx={{ fontSize: '0.875rem', color: '#344767', flex: 1 }}
            />
            {searchQuery && (
              <IconButton size="small" onClick={() => { setSearchQuery(''); setSearchOpen(false); }} sx={{ color: '#aaa' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
            <Typography variant="caption" sx={{ color: '#ccc', fontSize: '0.65rem', ml: 0.5, display: { xs: 'none', lg: 'block' } }}>⌘K</Typography>
          </Box>

          {/* Search Results Dropdown */}
          {searchOpen && searchQuery.length >= 2 && (
            <Paper
              sx={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: { xs: 0, sm: 'auto' },
                width: { xs: '100vw', sm: 420 },
                position: { xs: 'fixed', sm: 'absolute' },
                left: { xs: 16, sm: 0 },
                right: { xs: 16, sm: 'auto' },
                maxWidth: 420,
                maxHeight: 480,
                overflow: 'auto',
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: 1300,
              }}
            >
              {searchLoading ? (
                <Box sx={{ p: 3, textAlign: 'center', color: '#7B809A' }}>
                  <Typography variant="body2">Searching...</Typography>
                </Box>
              ) : allResults.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', color: '#7B809A' }}>
                  <Typography variant="body2">No results for "{searchQuery}"</Typography>
                </Box>
              ) : (
                Object.entries(searchResults).filter(([, items]) => items.length > 0).map(([group, items]) => (
                  <Box key={group}>
                    <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                      {groupIcons[group]}
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#7B809A', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                        {groupLabels[group]} ({items.length})
                      </Typography>
                    </Box>
                    <List sx={{ p: 0 }}>
                      {items.map((item) => {
                        const globalIdx = allResults.indexOf(item);
                        return (
                          <ListItem
                            key={item.id}
                            onClick={() => handleResultClick(item)}
                            sx={{
                              px: 2,
                              py: 1,
                              cursor: 'pointer',
                              bgcolor: globalIdx === selectedIndex ? '#f0f7ff' : 'transparent',
                              '&:hover': { bgcolor: '#f5f5f5' },
                              borderBottom: '1px solid #f8f8f8',
                            }}
                            secondaryAction={
                              <KeyboardArrowRightIcon sx={{ color: '#ccc', fontSize: 18 }} />
                            }
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {searchIcons[item.type]}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', fontSize: '0.85rem' }}>
                                  {item.title}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" sx={{ color: '#7B809A', fontSize: '0.75rem' }}>
                                  {item.subtitle}
                                </Typography>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                ))
              )}
            </Paper>
          )}
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
