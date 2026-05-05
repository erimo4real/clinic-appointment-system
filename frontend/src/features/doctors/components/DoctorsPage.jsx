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
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import EventNoteIcon from '@mui/icons-material/EventNote';
import WorkIcon from '@mui/icons-material/Work';
import api from '../../../shared/services/api';

const DoctorsPage = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favoriteDoctors');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [doctorRatings, setDoctorRatings] = useState({});

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await api.get('/feedback');
        const data = response.data;
        const ratings = {};
        if (Array.isArray(data)) {
          data.forEach(fb => {
            if (fb.doctor_id) {
              if (!ratings[fb.doctor_id]) {
                ratings[fb.doctor_id] = { sum: 0, count: 0 };
              }
              ratings[fb.doctor_id].sum += fb.rating || 0;
              ratings[fb.doctor_id].count += 1;
            }
          });
          Object.keys(ratings).forEach(id => {
            ratings[id].avg = ratings[id].sum / ratings[id].count;
          });
        }
        setDoctorRatings(ratings);
      } catch (err) {
        // Silent fail for ratings
      }
    };
    fetchRatings();
  }, []);

  const toggleFavorite = (doctorId) => {
    const newFavorites = favorites.includes(doctorId)
      ? favorites.filter(id => id !== doctorId)
      : [...favorites, doctorId];
    setFavorites(newFavorites);
    try {
      localStorage.setItem('favoriteDoctors', JSON.stringify(newFavorites));
    } catch {
      // LocalStorage might not be available
    }
  };

  const isFavorite = (doctorId) => favorites.includes(doctorId);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/doctors');
        const doctorsData = response.data;
        const data = Array.isArray(doctorsData) ? doctorsData : [];
        setDoctors(data);

        const uniqueSpecialties = [...new Set(data.map(d => d.specialty).filter(Boolean))];
        setSpecialties(uniqueSpecialties);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const getDoctorName = (doctor) => {
    const firstName = doctor?.user?.firstName || doctor?.firstName || doctor?.first_name || '';
    const lastName = doctor?.user?.lastName || doctor?.lastName || doctor?.last_name || '';
    const name = `${firstName} ${lastName}`.trim();
    return name ? `Dr. ${name}` : doctor?.fullName || doctor?.name || 'Doctor';
  };

  const getDoctorImage = (doctor) => {
    const img = doctor?.profileImage
      || doctor?.user?.profileImage
      || doctor?.profile_image
      || doctor?.user?.profile_image
      || null;
    return img;
  };

  const getDoctorInitials = (doctor) => {
    const first = doctor?.user?.firstName || doctor?.firstName || doctor?.first_name || '';
    const last = doctor?.user?.lastName || doctor?.lastName || doctor?.last_name || '';
    return (first[0] || last[0] || 'D').toUpperCase();
  };

  const filteredDoctors = selectedSpecialty
    ? doctors.filter(d => d.specialty === selectedSpecialty)
    : doctors;

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Services', to: '/services' },
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
                <Typography sx={{ color: '#1A73E8', fontWeight: 600, fontSize: '0.875rem' }}>Doctors</Typography>
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
          <Typography variant="h2" sx={{ fontWeight: 800, color: '#fff', mb: 2 }}>Our Expert Doctors</Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
            Meet our team of experienced medical professionals
          </Typography>
        </Container>
      </Box>

      {/* Doctors Grid */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl">
          {error && (
            <Paper sx={{ borderRadius: 2, p: 3, mb: 4, bgcolor: '#ffebee', border: '1px solid #ffcdd2' }}>
              <Typography variant="body1" sx={{ color: '#c62828' }}>Unable to load doctors. Please try again later.</Typography>
            </Paper>
          )}

          {/* Specialty Filter */}
          {specialties.length > 1 && (
            <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="All Specialties"
                onClick={() => setSelectedSpecialty('')}
                sx={{
                  borderRadius: 4, fontWeight: 500, cursor: 'pointer',
                  bgcolor: selectedSpecialty === '' ? '#1A73E8' : '#e0e0e0',
                  color: selectedSpecialty === '' ? '#fff' : '#757575',
                  '&:hover': { bgcolor: selectedSpecialty === '' ? '#1557B0' : '#bdbdbd' }
                }}
              />
              {specialties.map((specialty) => (
                <Chip
                  key={specialty}
                  label={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  sx={{
                    borderRadius: 4, fontWeight: 500, cursor: 'pointer',
                    bgcolor: selectedSpecialty === specialty ? '#1A73E8' : '#e0e0e0',
                    color: selectedSpecialty === specialty ? '#fff' : '#757575',
                    '&:hover': { bgcolor: selectedSpecialty === specialty ? '#1557B0' : '#bdbdbd' }
                  }}
                />
              ))}
            </Box>
          )}

          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card sx={{ borderRadius: 3 }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="circular" width={64} height={64} sx={{ mb: 2 }} />
                      <Skeleton variant="text" width="60%" height={28} />
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="text" width="80%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : filteredDoctors.length === 0 ? (
            <Paper sx={{ borderRadius: 3, p: 6, textAlign: 'center' }}>
              <MedicalServicesIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#7B809A' }}>No doctors available at the moment.</Typography>
              <Typography variant="body2" sx={{ color: '#aaa', mt: 1 }}>Please check back later.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredDoctors.map((doctor) => {
                const doctorId = doctor._id || doctor.id;
                const rating = doctorRatings[doctorId];
                const avgRating = rating?.avg || 0;
                const ratingCount = rating?.count || 0;

                return (
                  <Grid item xs={12} sm={6} md={4} key={doctorId}>
                    <Card sx={{
                      borderRadius: 3, overflow: 'hidden', position: 'relative', height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 }
                    }}>
                      {/* Favorite Button */}
                      <IconButton
                        onClick={() => toggleFavorite(doctorId)}
                        sx={{
                          position: 'absolute', top: 12, right: 12, zIndex: 10,
                          bgcolor: isFavorite(doctorId) ? '#ef5350' : 'rgba(255,255,255,0.8)',
                          color: isFavorite(doctorId) ? '#fff' : '#757575',
                          '&:hover': { bgcolor: isFavorite(doctorId) ? '#e53935' : 'rgba(255,255,255,1)' }
                        }}
                      >
                        {isFavorite(doctorId) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>

                      {/* Doctor Image */}
                      <Box sx={{
                        background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                        p: 5, display: 'flex', justifyContent: 'center'
                      }}>
                        {getDoctorImage(doctor) ? (
                          <Box
                            component="img"
                            src={getDoctorImage(doctor)}
                            alt={getDoctorName(doctor)}
                            sx={{
                              width: 128, height: 128, borderRadius: '50%',
                              border: '4px solid #fff', boxShadow: 2, objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <Avatar sx={{
                            width: 128, height: 128,
                            background: 'linear-gradient(135deg, #1A73E8, #4285F4)',
                            fontSize: 36, fontWeight: 600, border: '4px solid #fff', boxShadow: 2
                          }}>
                            {getDoctorInitials(doctor)}
                          </Avatar>
                        )}
                      </Box>

                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767', mb: 0.5 }}>
                          {getDoctorName(doctor)}
                        </Typography>
                        <Chip label={doctor.specialty || 'General'} size="small" sx={{ mb: 1, bgcolor: '#e3f2fd', color: '#1A73E8', fontWeight: 600 }} />
                        {doctor.qualification && (
                          <Typography variant="body2" sx={{ color: '#7B809A', mb: 1 }}>{doctor.qualification}</Typography>
                        )}

                        {/* Ratings */}
                        {avgRating > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Box key={star} sx={{ display: 'flex', alignItems: 'center' }}>
                                {star <= Math.round(avgRating) ? (
                                  <StarIcon sx={{ fontSize: 18, color: '#FFB400' }} />
                                ) : (
                                  <StarBorderIcon sx={{ fontSize: 18, color: '#e0e0e0' }} />
                                )}
                              </Box>
                            ))}
                            <Typography variant="body2" sx={{ color: '#7B809A', ml: 0.5 }}>({ratingCount} reviews)</Typography>
                          </Box>
                        )}

                        {doctor.bio && (
                          <Typography variant="body2" sx={{ color: '#7B809A', mb: 2, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {doctor.bio}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid #f0f0f0', mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <WorkIcon sx={{ fontSize: 16, color: '#7B809A' }} />
                            <Typography variant="body2" sx={{ color: '#7B809A' }}>
                              {doctor.experience ? `${doctor.experience} years` : 'Experience varies'}
                            </Typography>
                          </Box>
                          <Link to={`/booking?doctorId=${doctorId}`} style={{ textDecoration: 'none' }}>
                            <Button
                              size="small"
                              endIcon={<ArrowForwardIcon />}
                              sx={{ color: '#1A73E8', fontWeight: 700, textTransform: 'none' }}
                            >
                              Book
                            </Button>
                          </Link>
                        </Box>

                        {doctor.consultationFee && (
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50', mt: 1.5 }}>
                            ₦{doctor.consultationFee.toLocaleString()}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
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

export default DoctorsPage;
