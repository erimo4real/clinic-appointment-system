import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors } from '../../features/doctors/store/doctorSlice';
import {
  Box, Typography, Button, Container, Grid, Card, CardContent,
  Avatar, AppBar, Toolbar, IconButton, Chip, Paper, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import api from '../services/api';

const LandingPage = () => {
  const dispatch = useDispatch();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [services, setServices] = useState([]);
  const { doctors } = useSelector((state) => state.doctors);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await dispatch(fetchDoctors());
        const servicesRes = await api.get('/services');
        setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f2f5 0%, #e8f4fd 100%)' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, background: 'linear-gradient(135deg, #1A73E8, #4285F4)', animation: 'pulse 2s infinite' }}>
            <MedicalServicesIcon sx={{ fontSize: 40, color: '#fff' }} />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#344767', mb: 1 }}>MedBook Pro</Typography>
          <Typography variant="body1" sx={{ color: '#7B809A' }}>Loading...</Typography>
          <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }`}</style>
        </Box>
      </Box>
    );
  }

  const doctorCount = doctors.length;
  const specialtyCount = [...new Set(doctors.map(d => d.specialty).filter(Boolean))].length;

  const navLinks = [
    { label: 'Services', to: '/services' },
    { label: 'Doctors', to: '/doctors' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
        {/* Navigation */}
        <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #f0f2f5' }}>
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, background: 'linear-gradient(135deg, #1A73E8, #4285F4)', borderRadius: 2 }}>
                  <MedicalServicesIcon sx={{ fontSize: 22, color: '#fff' }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767' }}>MedBook Pro</Typography>
              </Box>

              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {navLinks.map(link => (
                    <Link key={link.to} to={link.to} style={{ color: '#7B809A', textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem' }}
                      onMouseEnter={(e) => (e.target.style.color = '#1A73E8')}
                      onMouseLeave={(e) => (e.target.style.color = '#7B809A')}>
                      {link.label}
                    </Link>
                  ))}
                  <Link to="/login" style={{ color: '#1A73E8', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>Sign In</Link>
                  <Link to="/register" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" size="small" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
                      Get Started
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
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', py: 1.5, color: '#1A73E8', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', display: 'block', mt: 1 }}>
                <Button fullWidth variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
                  Get Started
                </Button>
              </Link>
            </Box>
          )}
        </AppBar>

        {/* Hero Section */}
        <Box sx={{ pt: { xs: 10, md: 14 }, pb: { xs: 8, md: 12 }, background: 'linear-gradient(135deg, #f0f2f5 0%, #e8f4fd 50%, #f3e5f5 100%)' }}>
          <Container maxWidth="xl">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <Chip label="Trusted Healthcare Platform" size="small" sx={{ mb: 2, bgcolor: '#e3f2fd', color: '#1A73E8', fontWeight: 600 }} />
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#344767', lineHeight: 1.2, mb: 3 }}>
                  Your Health, <Box component="span" sx={{ color: '#1A73E8' }}>Our Priority</Box>
                </Typography>
                <Typography variant="h6" sx={{ color: '#7B809A', fontWeight: 400, mb: 4, maxWidth: 500 }}>
                  Book appointments with top-rated doctors in minutes. Experience modern healthcare that's convenient, reliable, and always available.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Link to="/booking" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" size="large" startIcon={<EventNoteIcon />}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)', boxShadow: '0 4px 7px -1px rgba(26,115,232,0.3)' }}>
                      Book Appointment
                    </Button>
                  </Link>
                  <Link to="/doctors" style={{ textDecoration: 'none' }}>
                    <Button variant="outlined" size="large" endIcon={<ArrowForwardIcon />}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: '#344767', borderColor: '#e0e0e0' }}>
                      View Doctors
                    </Button>
                  </Link>
                </Box>
                <Box sx={{ display: 'flex', gap: 6, mt: 6 }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#344767' }}>{doctorCount}</Typography>
                    <Typography variant="body2" sx={{ color: '#7B809A' }}>Expert Doctors</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#344767' }}>{doctorCount * 50}+</Typography>
                    <Typography variant="body2" sx={{ color: '#7B809A' }}>Happy Patients</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#344767' }}>{specialtyCount}</Typography>
                    <Typography variant="body2" sx={{ color: '#7B809A' }}>Specialties</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Paper elevation={6} sx={{ borderRadius: 4, p: 5, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', bgcolor: '#e3f2fd', opacity: 0.6 }} />
                  <Box sx={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', bgcolor: '#f3e5f5', opacity: 0.6 }} />
                  <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)' }}>
                    <PeopleIcon sx={{ fontSize: 40, color: '#1A73E8' }} />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767', mb: 1 }}>Book an Appointment</Typography>
                  <Typography variant="body2" sx={{ color: '#7B809A', mb: 3 }}>Schedule a visit with our specialists</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                      <StarIcon sx={{ color: '#FFB400', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#344767' }}>Top-rated doctors</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                      <EventNoteIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#344767' }}>Easy online booking</Typography>
                    </Box>
                    <Link to="/booking" style={{ textDecoration: 'none' }}>
                      <Button fullWidth variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
                        Book Now
                      </Button>
                    </Link>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Services Section */}
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f5f5f5' }}>
          <Container maxWidth="xl">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#344767', mb: 1 }}>Our Services</Typography>
              <Typography variant="body1" sx={{ color: '#7B809A', maxWidth: 500, mx: 'auto' }}>Comprehensive healthcare services for you and your family</Typography>
            </Box>
            {services.length === 0 ? (
              <Paper sx={{ borderRadius: 3, p: 6, textAlign: 'center' }}>
                <MedicalServicesIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#7B809A' }}>No services available</Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {services.slice(0, 6).map((service, i) => (
                  <Grid item xs={12} sm={6} md={4} key={service._id || service.id || i}>
                    <Card sx={{ borderRadius: 3, height: '100%', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 } }}>
                      <CardContent sx={{ p: 3 }}>
                        <Avatar sx={{ width: 56, height: 56, mb: 2, background: '#e3f2fd' }}>
                          <MedicalServicesIcon sx={{ color: '#1A73E8', fontSize: 28 }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767', mb: 1 }}>{service.name}</Typography>
                        <Typography variant="body2" sx={{ color: '#7B809A', mb: 2 }}>{service.description || 'Professional healthcare service'}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50' }}>${service.price || 0}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            {services.length > 6 && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Link to="/services" style={{ textDecoration: 'none' }}>
                  <Button variant="outlined" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: '#1A73E8', borderColor: '#1A73E8' }}>
                    View All Services
                  </Button>
                </Link>
              </Box>
            )}
          </Container>
        </Box>

        {/* Doctors Section */}
        <Box sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="xl">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#344767', mb: 1 }}>Our Expert Doctors</Typography>
              <Typography variant="body1" sx={{ color: '#7B809A', maxWidth: 500, mx: 'auto' }}>Meet our team of experienced medical professionals</Typography>
            </Box>
            {doctors.length === 0 ? (
              <Paper sx={{ borderRadius: 3, p: 6, textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#7B809A' }}>No doctors available</Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {doctors.slice(0, 4).map((doctor, i) => {
                  const firstName = doctor.user?.firstName || doctor.firstName || '';
                  const lastName = doctor.user?.lastName || doctor.lastName || '';
                  return (
                    <Grid item xs={12} sm={6} md={3} key={doctor._id || doctor.id || i}>
                      <Card sx={{ borderRadius: 3, textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 } }}>
                        <CardContent sx={{ p: 3 }}>
                          <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, background: 'linear-gradient(135deg, #1A73E8, #4285F4)', fontSize: 28, fontWeight: 600 }}>
                            {(firstName[0] || lastName[0] || 'D').toUpperCase()}
                          </Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767', mb: 0.5 }}>Dr. {firstName} {lastName}</Typography>
                          <Chip label={doctor.specialty || 'General'} size="small" sx={{ mb: 1, bgcolor: '#e3f2fd', color: '#1A73E8', fontWeight: 600 }} />
                          {doctor.experience && <Typography variant="body2" sx={{ color: '#7B809A' }}>{doctor.experience} years experience</Typography>}
                          <Link to="/booking" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 12 }}>
                            <Button size="small" endIcon={<ArrowForwardIcon />} sx={{ color: '#1A73E8', fontWeight: 700, textTransform: 'none' }}>Book</Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
            {doctors.length > 4 && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Link to="/doctors" style={{ textDecoration: 'none' }}>
                  <Button variant="outlined" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: '#1A73E8', borderColor: '#1A73E8' }}>
                    View All Doctors
                  </Button>
                </Link>
              </Box>
            )}
          </Container>
        </Box>

        {/* Why Choose Us */}
        <Box sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(135deg, #1A73E8 0%, #4285F4 50%, #7B1FA2 100%)', color: '#fff' }}>
          <Container maxWidth="xl">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 4 }}>Why Choose MedBook Pro?</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {[
                    { icon: <SecurityIcon />, title: 'Secure & Private', desc: 'Your medical information is protected with enterprise-grade security' },
                    { icon: <AccessTimeIcon />, title: '24/7 Availability', desc: 'Book appointments anytime, anywhere' },
                    { icon: <LocationOnIcon />, title: 'Multiple Locations', desc: 'Visit any of our conveniently located clinics' },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{item.icon}</Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{item.title}</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{item.desc}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  {[
                    { value: '98%', label: 'Patient Satisfaction' },
                    { value: `${specialtyCount}+`, label: 'Specialties' },
                    { value: `${doctorCount}`, label: 'Medical Experts' },
                    { value: '24/7', label: 'Support' },
                  ].map((stat, i) => (
                    <Grid item xs={6} key={i}>
                      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 3 }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>{stat.value}</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{stat.label}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ bgcolor: '#1a1a2e', py: 4 }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, background: 'linear-gradient(135deg, #1A73E8, #4285F4)', borderRadius: 2 }}>
                  <MedicalServicesIcon sx={{ fontSize: 22, color: '#fff' }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>MedBook Pro</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                © {new Date().getFullYear()} MedBook Pro. Clinic Appointment Management System
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
  );
};

export default LandingPage;
