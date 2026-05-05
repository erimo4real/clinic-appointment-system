import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button,
  Avatar, AppBar, Toolbar, Chip, Paper, Skeleton, IconButton,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import api from '../../../shared/services/api';

const getServiceIcon = (serviceName) => {
  const name = (serviceName || '').toLowerCase();
  if (name.includes('cardiac') || name.includes('heart')) return <FavoriteIcon />;
  if (name.includes('pediatric') || name.includes('child')) return <MedicalServicesIcon />;
  return <MedicalServicesIcon />;
};

const ServicesPage = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setServices(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Doctors', to: '/doctors' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Navigation */}
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #f0f2f5' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <Avatar sx={{ width: 40, height: 40, background: 'linear-gradient(135deg, #1A73E8, #4285F4)', borderRadius: 2 }}>
                <MedicalServicesIcon sx={{ fontSize: 22, color: '#fff' }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767' }}>MedBook Pro</Typography>
            </Link>

            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {navLinks.map(link => (
                  <Link key={link.to} to={link.to} style={{ color: '#7B809A', textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem' }}
                    onMouseEnter={(e) => (e.target.style.color = '#1A73E8')}
                    onMouseLeave={(e) => (e.target.style.color = '#7B809A')}>
                    {link.label}
                  </Link>
                ))}
                <Typography sx={{ color: '#1A73E8', fontWeight: 600, fontSize: '0.875rem' }}>Services</Typography>
                <Link to="/booking" style={{ textDecoration: 'none' }}>
                  <Button variant="contained" size="small" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
                    Book Appointment
                  </Button>
                </Link>
              </Box>
            )}

            {isMobile && (
              <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            )}
          </Toolbar>
        </Container>

        {isMobile && mobileMenuOpen && (
          <Box sx={{ bgcolor: '#fff', borderTop: '1px solid #f0f2f5', px: 3, py: 2 }}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'block', py: 1.5, color: '#7B809A', textDecoration: 'none', fontWeight: 500 }}>
                {link.label}
              </Link>
            ))}
            <Link to="/booking" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', display: 'block', mt: 1 }}>
              <Button fullWidth variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
                Book Appointment
              </Button>
            </Link>
          </Box>
        )}
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ pt: { xs: 10, md: 14 }, pb: { xs: 8, md: 12 }, background: 'linear-gradient(135deg, #1A73E8 0%, #4285F4 50%, #7B1FA2 100%)' }}>
        <Container maxWidth="xl" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#fff', mb: 2 }}>Our Medical Services</Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
            Comprehensive healthcare solutions for you and your family
          </Typography>
        </Container>
      </Box>

      {/* Services Grid */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl">
          {error && (
            <Paper sx={{ borderRadius: 2, p: 3, mb: 4, bgcolor: '#ffebee', border: '1px solid #ffcdd2' }}>
              <Typography variant="body1" sx={{ color: '#c62828' }}>Unable to load services. Please try again later.</Typography>
            </Paper>
          )}

          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                      <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
                      <Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width="100%" sx={{ mb: 1 }} />
                      <Skeleton variant="text" width="60%" sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Skeleton variant="text" width={80} />
                        <Skeleton variant="text" width={60} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : services.length === 0 ? (
            <Paper sx={{ borderRadius: 3, p: 6, textAlign: 'center' }}>
              <MedicalServicesIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#7B809A' }}>No services available at the moment.</Typography>
              <Typography variant="body2" sx={{ color: '#aaa', mt: 1 }}>Please check back later.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {services.map((service) => (
                <Grid item xs={12} sm={6} md={4} key={service._id || service.id}>
                  <Card sx={{
                    borderRadius: 3, height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 }
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Avatar sx={{ width: 56, height: 56, mb: 2, background: '#e3f2fd' }}>
                        {getServiceIcon(service.name)}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767', mb: 1 }}>{service.name}</Typography>
                      <Typography variant="body2" sx={{ color: '#7B809A', mb: 2, minHeight: 40 }}>
                        {service.description || 'Professional healthcare service'}
                      </Typography>
                      {service.duration && (
                        <Chip
                          icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                          label={`${service.duration} minutes`}
                          size="small"
                          sx={{ mb: 2, bgcolor: '#f5f5f5', color: '#7B809A' }}
                        />
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                          ₦{(service.price || 0).toLocaleString()}
                        </Typography>
                        <Link to={`/booking?serviceId=${service._id || service.id}`} style={{ textDecoration: 'none' }}>
                          <Button
                            size="small"
                            endIcon={<ArrowForwardIcon />}
                            sx={{ color: '#1A73E8', fontWeight: 700, textTransform: 'none' }}
                          >
                            Book
                          </Button>
                        </Link>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a1a2e', py: 6 }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Avatar sx={{ width: 40, height: 40, background: 'linear-gradient(135deg, #1A73E8, #4285F4)', borderRadius: 2 }}>
                  <MedicalServicesIcon sx={{ fontSize: 22, color: '#fff' }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>MedBook Pro</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Your trusted partner in modern healthcare management.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>Quick Links</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {navLinks.map(link => (
                  <Link key={link.to} to={link.to} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.875rem' }}
                    onMouseEnter={(e) => (e.target.style.color = '#fff')}
                    onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.5)')}>
                    {link.label}
                  </Link>
                ))}
                <Link to="/booking" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.875rem' }}
                  onMouseEnter={(e) => (e.target.style.color = '#fff')}
                  onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.5)')}>
                  Book Now
                </Link>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>Our Services</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(services.length > 0 ? services.slice(0, 4) : [
                  { name: 'General Medicine' }, { name: 'Cardiology' },
                  { name: 'Pediatrics' }, { name: 'Orthopedics' }
                ]).map((service, i) => (
                  <Typography key={i} variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                    {service.name}
                  </Typography>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>Contact</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>123 Medical Center Dr</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>+234 801 234 5678</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>contact@medbookpro.com</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 4, pt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              © {new Date().getFullYear()} MedBook Pro. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ServicesPage;
