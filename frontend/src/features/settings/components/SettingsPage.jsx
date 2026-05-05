import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, fetchCurrentUser } from '../../auth/store/authSlice';
import DashboardLayout from '../../../layout/MaterialDashboard/DashboardLayout';
import {
  Card, CardContent, Typography, Box, Avatar, TextField, Button,
  IconButton, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageUploadDialog from '../../../shared/components/ImageUploadDialog';
import api from '../../../shared/services/api';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '', lastName: '', username: '', email: '', phone: '', address: '', dateOfBirth: '', gender: '',
  });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      await dispatch(updateProfile(profile)).unwrap();
      setProfileSuccess('Profile updated successfully');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    }
    setProfileLoading(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await api.put('/auth/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSuccess('Password changed successfully');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
    setPasswordLoading(false);
  };

  const handleRemoveImage = async () => {
    setUploading(true);
    try {
      await api.put('/auth/profile', { profileImage: '' });
      await dispatch(fetchCurrentUser());
      setProfileSuccess('Profile photo removed');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError('Failed to remove photo');
    }
    setUploading(false);
  };

  const handleImageUploadSuccess = async () => {
    await dispatch(fetchCurrentUser());
    setProfileSuccess('Profile photo updated');
    setTimeout(() => setProfileSuccess(''), 4000);
  };

  if (!user) return null;

  const displayName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username || 'User';
  const initials = `${(profile.firstName || profile.username || 'U')[0]}${(profile.lastName || '')[0]}`.toUpperCase();

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767' }}>Settings</Typography>
          <Typography variant="body2" sx={{ color: '#7B809A' }}>Manage your account settings and security</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Profile Photo Card */}
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 2, bgcolor: '#E8F5E9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <PhotoCameraIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767', fontSize: '1.05rem' }}>
                    Profile Photo
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7B809A', fontSize: '0.8rem' }}>
                    Upload or update your profile picture
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                {/* Current Photo Display */}
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar
                    sx={{
                      width: 100, height: 100,
                      background: 'linear-gradient(135deg, #1A73E8, #4285F4)',
                      fontSize: 36, fontWeight: 600,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    }}
                  >
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : initials}
                  </Avatar>
                  {user.profileImage && (
                    <Box sx={{
                      position: 'absolute', bottom: 2, right: 2,
                      width: 28, height: 28, borderRadius: '50%',
                      bgcolor: '#4CAF50', border: '2px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography variant="caption" sx={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>✓</Typography>
                    </Box>
                  )}
                </Box>

                {/* Photo Actions */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', mb: 0.25 }}>{displayName}</Typography>
                    <Typography variant="caption" sx={{ color: '#7B809A' }}>
                      {user.profileImage ? 'Photo uploaded' : 'No photo uploaded'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => setImageDialogOpen(true)}
                      sx={{
                        borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem',
                        background: 'linear-gradient(135deg, #1A73E8, #4285F4)',
                        boxShadow: '0 2px 8px rgba(26,115,232,0.3)',
                      }}
                    >
                      {user.profileImage ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {user.profileImage && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DeleteForeverIcon />}
                        color="error"
                        onClick={handleRemoveImage}
                        disabled={uploading}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                      >
                        {uploading ? <CircularProgress size={16} /> : 'Remove'}
                      </Button>
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: '#9E9E9E' }}>
                    JPG, PNG, GIF, WebP • Max 5MB
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Profile Edit Card */}
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 2, bgcolor: '#E3F2FD',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <PersonIcon sx={{ color: '#1A73E8', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767', fontSize: '1.05rem' }}>
                    Personal Information
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7B809A', fontSize: '0.8rem' }}>
                    Update your personal details
                  </Typography>
                </Box>
              </Box>

              {profileSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{profileSuccess}</Alert>}
              {profileError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{profileError}</Alert>}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="First Name"
                    fullWidth
                    size="small"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    label="Last Name"
                    fullWidth
                    size="small"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>

                <TextField
                  label="Username"
                  fullWidth
                  size="small"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    size="small"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    sx={{ flex: { xs: '1', sm: '1' }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    label="Phone"
                    fullWidth
                    size="small"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    sx={{ flex: { xs: '1', sm: '1' }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>

                <TextField
                  label="Address"
                  fullWidth
                  size="small"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    size="small"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: { xs: '1', sm: '1' }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <FormControl fullWidth size="small" sx={{ flex: { xs: '1', sm: '1' } }}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={profile.gender}
                      label="Gender"
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">Select</MenuItem>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={profileLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={profileLoading}
                    sx={{
                      borderRadius: 2, textTransform: 'none', fontWeight: 700,
                      background: 'linear-gradient(135deg, #1A73E8, #4285F4)',
                      boxShadow: '0 4px 12px rgba(26,115,232,0.3)',
                      '&:hover': { boxShadow: '0 6px 16px rgba(26,115,232,0.4)' },
                    }}
                  >
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 2, bgcolor: '#FFF3E0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <LockIcon sx={{ color: '#E65100', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767', fontSize: '1.05rem' }}>
                    Change Password
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7B809A', fontSize: '0.8rem' }}>
                    Update your account password
                  </Typography>
                </Box>
              </Box>

              {passwordSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{passwordSuccess}</Alert>}
              {passwordError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{passwordError}</Alert>}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: { xs: '100%', sm: 500 } }}>
                <TextField
                  label="Current Password"
                  type={showPassword.current ? 'text' : 'password'}
                  fullWidth
                  size="small"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                        edge="end"
                        size="small"
                      >
                        {showPassword.current ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    )
                  }}
                />
                <TextField
                  label="New Password"
                  type={showPassword.new ? 'text' : 'password'}
                  fullWidth
                  size="small"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        edge="end"
                        size="small"
                      >
                        {showPassword.new ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    )
                  }}
                />
                <TextField
                  label="Confirm New Password"
                  type={showPassword.confirm ? 'text' : 'password'}
                  fullWidth
                  size="small"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        edge="end"
                        size="small"
                      >
                        {showPassword.confirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    )
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={passwordLoading ? <CircularProgress size={20} color="inherit" /> : <VpnKeyIcon />}
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    sx={{
                      borderRadius: 2, textTransform: 'none', fontWeight: 700,
                      background: 'linear-gradient(135deg, #E65100, #FF9800)',
                      boxShadow: '0 4px 12px rgba(230,81,0,0.3)',
                      '&:hover': { boxShadow: '0 6px 16px rgba(230,81,0,0.4)' },
                    }}
                  >
                    {passwordLoading ? 'Updating...' : 'Change Password'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Image Upload Dialog */}
        <ImageUploadDialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          entity={user}
          entityId={user?._id || user?.id}
          updateEndpoint="/auth/profile"
          onSuccess={handleImageUploadSuccess}
          entityName={displayName}
        />
      </Box>
    </DashboardLayout>
  );
};

export default SettingsPage;
