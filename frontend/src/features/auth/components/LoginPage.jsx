import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/authSlice';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const hasPendingBooking = useSelector((state) => state.appointments?.hasPendingBooking);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  return (
    <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1A73E8 0%, #4285F4 50%, #7B1FA2 100%)',
          p: 3,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 2,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <MedicalServicesIcon sx={{ fontSize: 32, color: '#fff' }} />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
            MedBook Pro
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Sign in to your account
          </Typography>
        </Box>

        <Card
          sx={{
            maxWidth: 400,
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767', mb: 0.5 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: '#7B809A', mb: 3 }}>
              Enter your email and password to sign in
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#7B809A' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1A73E8',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#7B809A' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#1A73E8',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #1A73E8 0%, #4285F4 100%)',
                  boxShadow: '0 4px 7px -1px rgba(26,115,232,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1557B0 0%, #1A73E8 100%)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#fff' }} />
                ) : (
                  hasPendingBooking ? 'Sign In & Save Booking' : 'Sign In'
                )}
              </Button>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#7B809A' }}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{ color: '#1A73E8', fontWeight: 700, textDecoration: 'none' }}
                >
                  Create one
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Link
          to="/"
          style={{
            color: 'rgba(255,255,255,0.8)',
            marginTop: 24,
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}
          onMouseEnter={(e) => (e.target.style.color = '#fff')}
          onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.8)')}
        >
          Back to Home
        </Link>
      </Box>
  );
};

export default LoginPage;
