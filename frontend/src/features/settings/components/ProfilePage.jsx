import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layout/MaterialDashboard/DashboardLayout';
import {
  Card, CardContent, Typography, Box, Avatar, Chip,
  Button, Divider, CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ImageUploadDialog from '../../../shared/components/ImageUploadDialog';

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.75 }}>
    <Box sx={{
      width: 36, height: 36, borderRadius: 2, bgcolor: '#f0f2f5',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 500, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: '#344767', fontWeight: 600, fontSize: '0.9rem', mt: 0.25, wordBreak: 'break-word' }}>
        {value || <Typography component="span" sx={{ color: '#B0BEC5', fontWeight: 400 }}>Not set</Typography>}
      </Typography>
    </Box>
  </Box>
);

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!user) return null;

  const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User';
  const initials = `${(user.firstName || user.username || 'U')[0]}${(user.lastName || '')[0]}`.toUpperCase();
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const dateOfBirth = user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  const roleColors = {
    admin: { bg: '#E8F5E9', color: '#2E7D32' },
    doctor: { bg: '#E3F2FD', color: '#1A73E8' },
    patient: { bg: '#FFF3E0', color: '#E65100' },
    receptionist: { bg: '#F3E5F5', color: '#7B1FA2' },
  };

  const roleColor = roleColors[user.role] || roleColors.patient;

  return (
    <DashboardLayout>
      <Box
        sx={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767' }}>Profile</Typography>
            <Typography variant="body2" sx={{ color: '#7B809A' }}>Your personal information</Typography>
          </Box>
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate('/dashboard/settings')}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
            Edit Profile
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2.5, flex: 1, minHeight: 0, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
          {/* Left Column - Profile Card */}
          <Card sx={{
            borderRadius: 2, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)',
            width: { xs: '100%', lg: 340 }, flexShrink: 0,
          }}>
            <Box sx={{
              height: 120,
              background: 'linear-gradient(135deg, #1A73E8 0%, #4285F4 50%, #64B5F6 100%)',
              borderRadius: '16px 16px 0 0',
              position: 'relative',
            }} />
            <CardContent sx={{ px: 3, pb: 3, pt: 0, position: 'relative' }}>
              <Box sx={{
                position: 'relative', display: 'inline-block',
                mt: -5, mb: 2,
              }}>
                <Avatar
                  onClick={() => setImageDialogOpen(true)}
                  sx={{
                    width: 96, height: 96,
                    background: 'linear-gradient(135deg, #1A73E8, #4285F4)',
                    fontSize: 32, fontWeight: 600,
                    border: '4px solid #fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    '&:hover .photo-overlay': { opacity: 1 },
                  }}
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : initials}
                </Avatar>
                <Box className="photo-overlay" sx={{
                  position: 'absolute', top: 4, left: 4, right: 4, bottom: 4, borderRadius: '50%',
                  bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity 0.2s',
                }}>
                  <PhotoCameraIcon sx={{ color: '#fff', fontSize: 24 }} />
                </Box>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767', mb: 0.5 }}>{displayName}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  size="small"
                  sx={{
                    bgcolor: roleColor.bg, color: roleColor.color, fontWeight: 700, fontSize: '0.7rem', borderRadius: 1,
                  }}
                />
                <Typography variant="caption" sx={{ color: '#7B809A' }}>
                  Member since {memberSince}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <InfoRow icon={<EmailIcon sx={{ fontSize: 18, color: '#1A73E8' }} />} label="Email" value={user.email} />
              <InfoRow icon={<PhoneIcon sx={{ fontSize: 18, color: '#1A73E8' }} />} label="Phone" value={user.phone} />
              <InfoRow icon={<LocationOnIcon sx={{ fontSize: 18, color: '#1A73E8' }} />} label="Address" value={user.address} />
            </CardContent>
          </Card>

          {/* Right Column - Details */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0 }}>
            {/* Personal Information */}
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <PersonIcon sx={{ color: '#1A73E8', fontSize: 22 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767', fontSize: '1.05rem' }}>
                    Personal Information
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#7B809A', mb: 2.5, fontSize: '0.8rem' }}>
                  Your basic personal details
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
                  <InfoRow icon={<BadgeIcon sx={{ fontSize: 18, color: '#1A73E8' }} />} label="Username" value={user.username} />
                  <InfoRow icon={<CakeIcon sx={{ fontSize: 18, color: '#1A73E8' }} />} label="Date of Birth" value={dateOfBirth} />
                  <InfoRow icon={<WcIcon sx={{ fontSize: 18, color: '#1A73E8' }} />} label="Gender" value={user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : ''} />
                </Box>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <CalendarTodayIcon sx={{ color: '#1A73E8', fontSize: 22 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767', fontSize: '1.05rem' }}>
                    Account Information
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#7B809A', mb: 2.5, fontSize: '0.8rem' }}>
                  Details about your account
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
                  <InfoRow icon={<BadgeIcon sx={{ fontSize: 18, color: '#1A73E8' }} />} label="Role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} />
                  <InfoRow icon={<CalendarTodayIcon sx={{ fontSize: 18, color: '#1A73E8' }} />} label="Member Since" value={memberSince} />
                  <InfoRow icon={<EmailIcon sx={{ fontSize: 18, color: '#1A73E8' }} />} label="Email Address" value={user.email} />
                </Box>
              </CardContent>
            </Card>

            {/* Emergency Contact (if doctor/patient) */}
            {user.role === 'patient' && (
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <PhoneIcon sx={{ color: '#1A73E8', fontSize: 22 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767', fontSize: '1.05rem' }}>
                      Emergency Contact
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#7B809A', mb: 2.5, fontSize: '0.8rem' }}>
                    Your emergency contact information
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
                    <InfoRow icon={<PersonIcon sx={{ fontSize: 18, color: '#1A73E8' }} />} label="Contact Name" value={user.emergencyContactName} />
                    <InfoRow icon={<PhoneIcon sx={{ fontSize: 18, color: '#1A73E8' }} />} label="Contact Phone" value={user.emergencyContactPhone} />
                    <InfoRow icon={<BadgeIcon sx={{ fontSize: 18, color: '#1A73E8' }} />} label="Relationship" value={user.emergencyContactRelationship} />
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>

        <ImageUploadDialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          entity={user}
          entityId={user?._id || user?.id}
          updateEndpoint="/auth/profile"
          onSuccess={() => {}}
          entityName={displayName}
        />
      </Box>
    </DashboardLayout>
  );
};

export default ProfilePage;
