import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors, fetchAvailableSlots, fetchServices } from '../../doctors/store/doctorSlice';
import { register } from '../../auth/store/authSlice';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button,
  TextField, Avatar, AppBar, Toolbar, IconButton, Chip, Paper,
  Stepper, Step, StepLabel, StepConnector, stepConnectorClasses,
  CircularProgress, Alert, InputAdornment, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../../shared/services/api';

// ─────────────────────────────────────────────
// Shared utility: Get doctor name (single source of truth)
// ─────────────────────────────────────────────
const getDoctorName = (doctor) => {
  if (!doctor) return 'Doctor';
  if (doctor.user) {
    return `Dr. ${doctor.user.firstName || ''} ${doctor.user.lastName || ''}`.trim() || 'Doctor';
  }
  return doctor.name || doctor.fullName || 'Doctor';
};

// ─────────────────────────────────────────────
// Shared utility: Extract ID from object (handles id and _id)
// ─────────────────────────────────────────────
const getId = (obj) => obj?.id || obj?._id;

const BOOKING_STORAGE_KEY = 'pending_booking_data';

// ─────────────────────────────────────────────
// Styled connector for stepper
// ─────────────────────────────────────────────
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`&.${stepConnectorClasses.active}`]: { [`& .${stepConnectorClasses.line}`]: { backgroundImage: 'linear-gradient(95deg, #1A73E8 0%, #4285F4 100%)' } },
  [`&.${stepConnectorClasses.completed}`]: { [`& .${stepConnectorClasses.line}`]: { backgroundImage: 'linear-gradient(95deg, #1A73E8 0%, #4285F4 100%)' } },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3, border: 0, borderRadius: 1,
    backgroundColor: '#e0e0e0',
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  zIndex: 1, color: '#fff', width: 44, height: 44,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: '50%',
  ...(ownerState.active && {
    backgroundImage: 'linear-gradient(135deg, #1A73E8 0%, #4285F4 100%)',
    boxShadow: '0 4px 7px -1px rgba(26,115,232,0.3)',
  }),
  ...(ownerState.completed && {
    backgroundImage: 'linear-gradient(135deg, #1A73E8 0%, #4285F4 100%)',
  }),
  ...(!ownerState.active && !ownerState.completed && {
    backgroundColor: '#e0e0e0', color: '#757575',
  }),
}));

const ColorlibStepIcon = (props) => {
  const { active, completed, className } = props;
  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? <CheckCircleIcon sx={{ fontSize: 22 }} /> : props.icon}
    </ColorlibStepIconRoot>
  );
};

// ─────────────────────────────────────────────
// Specialty options for filtering
// ─────────────────────────────────────────────
const specialties = [
  'All Specialties', 'General Medicine', 'Cardiology', 'Neurology',
  'Orthopedics', 'Pediatrics', 'Dermatology', 'Ophthalmology', 'ENT',
  'Gynecology', 'Psychiatry', 'Oncology', 'Gastroenterology',
  'Pulmonology', 'Urology', 'Endocrinology', 'Rheumatology',
];

// ─────────────────────────────────────────────
// Header Component
// ─────────────────────────────────────────────
const Header = ({ isMobile, mobileMenuOpen, setMobileMenuOpen }) => (
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
            <Link to="/doctors" style={{ color: '#7B809A', textDecoration: 'none', fontWeight: 500, fontSize: '0.875rem' }}
              onMouseEnter={(e) => (e.target.style.color = '#1A73E8')}
              onMouseLeave={(e) => (e.target.style.color = '#7B809A')}>
              View Doctors
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="contained" size="small" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
                Sign In
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
        <Link to="/doctors" onClick={() => setMobileMenuOpen(false)}
          style={{ display: 'block', py: 1.5, color: '#7B809A', textDecoration: 'none', fontWeight: 500 }}>
          View Doctors
        </Link>
        <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', display: 'block', mt: 1 }}>
          <Button fullWidth variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
            Sign In
          </Button>
        </Link>
      </Box>
    )}
  </AppBar>
);

// ─────────────────────────────────────────────
// HeroSection Component
// ─────────────────────────────────────────────
const HeroSection = () => (
  <Box sx={{
    pt: { xs: 10, md: 14 }, pb: { xs: 6, md: 10 },
    background: 'linear-gradient(135deg, #1A73E8 0%, #4285F4 50%, #7B1FA2 100%)',
    color: '#fff'
  }}>
    <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>Book Your Appointment</Typography>
      <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400, mb: 6, maxWidth: 500, mx: 'auto' }}>
        Quality healthcare made simple and accessible
      </Typography>
      <Grid container spacing={3} sx={{ maxWidth: 700, mx: 'auto' }}>
        {[
          { icon: <PersonIcon sx={{ fontSize: 28 }} />, title: '1. Choose Doctor', desc: 'Browse our specialists' },
          { icon: <MedicalServicesIcon sx={{ fontSize: 28 }} />, title: '2. Select Service', desc: 'Pick your treatment' },
          { icon: <CalendarTodayIcon sx={{ fontSize: 28 }} />, title: '3. Pick Time', desc: 'Schedule your visit' },
        ].map((item, i) => (
          <Grid item xs={4} key={i}>
            <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 3 }}>
              <Avatar sx={{ width: 48, height: 48, mx: 'auto', mb: 1.5, bgcolor: 'rgba(255,255,255,0.2)' }}>
                {item.icon}
              </Avatar>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{item.title}</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>{item.desc}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

// ─────────────────────────────────────────────
// BookingSuccessPage Component
// ─────────────────────────────────────────────
const BookingSuccessPage = ({ bookingData, onCreateAccount, onSignIn, onBackHome, isRegistering, registerForm, setRegisterForm, handleRegister, registerLoading, registerError }) => {
  return (
    <Box sx={{ maxWidth: 500, mx: 'auto' }}>
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #1A73E8, #4285F4)', p: 4, textAlign: 'center', color: '#fff' }}>
          <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
            <CheckCircleIcon sx={{ fontSize: 36 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Booking Confirmed!</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>Your appointment has been booked successfully</Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Paper sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#344767', mb: 0.5 }}>{getDoctorName(bookingData.doctor)}</Typography>
            <Typography variant="body2" sx={{ color: '#7B809A' }}>{bookingData.service?.name}</Typography>
            <Typography variant="body2" sx={{ color: '#7B809A' }}>
              {new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>
            <Typography variant="body2" sx={{ color: '#7B809A' }}>
              at {typeof bookingData.timeSlot === 'string' ? bookingData.timeSlot : bookingData.timeSlot?.start_time}
            </Typography>
          </Paper>

          {isRegistering ? (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767', mb: 0.5, textAlign: 'center' }}>Create Your Account</Typography>
              <Typography variant="body2" sx={{ color: '#7B809A', mb: 3, textAlign: 'center' }}>Save your booking to track appointments</Typography>

              {registerError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{registerError}</Alert>}

              <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="First Name" value={registerForm.firstName}
                      onChange={(e) => setRegisterForm({...registerForm, firstName: e.target.value})} required size="small" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Last Name" value={registerForm.lastName}
                      onChange={(e) => setRegisterForm({...registerForm, lastName: e.target.value})} required size="small" />
                  </Grid>
                </Grid>
                <TextField fullWidth label="Email Address" type="email" value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} required size="small" />
                <TextField fullWidth label="Phone Number" type="tel" value={registerForm.phone}
                  onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})} required size="small" />
                <TextField fullWidth label="Password" type="password" value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} required size="small" inputProps={{ minLength: 6 }} />
                <Button type="submit" fullWidth variant="contained" size="large" disabled={registerLoading}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, py: 1.5, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
                  {registerLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Create Account'}
                </Button>
                <Button onClick={onBackHome} sx={{ color: '#7B809A' }}>Skip — Go Home</Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button onClick={onCreateAccount} fullWidth variant="contained" size="large"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, py: 1.5, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
                Create Account (Recommended)
              </Button>
              <Box sx={{ position: 'relative', textAlign: 'center' }}>
                <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid #e0e0e0' }} />
                <Box sx={{ position: 'relative', display: 'inline-block', px: 2, bgcolor: '#fff' }}>
                  <Typography variant="body2" sx={{ color: '#7B809A' }}>Or</Typography>
                </Box>
              </Box>
              <Button onClick={onSignIn} fullWidth variant="outlined" size="large"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, py: 1.5 }}>
                Sign In to Existing Account
              </Button>
              <Button onClick={onBackHome} sx={{ color: '#7B809A' }}>Go Home</Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

// ─────────────────────────────────────────────
// DoctorCard Component
// ─────────────────────────────────────────────
const DoctorCard = ({ doctor, isSelected, onSelect }) => {
  const serviceNames = doctor.services?.slice(0, 3).map(s => s.name) || [];

  return (
    <Button
      onClick={() => onSelect(doctor)}
      sx={{
        width: '100%', p: 3, borderRadius: 3, textAlign: 'left',
        border: '2px solid', textTransform: 'none',
        borderColor: isSelected ? '#1A73E8' : '#e0e0e0',
        bgcolor: isSelected ? '#e3f2fd' : '#fff',
        boxShadow: isSelected ? 3 : 'none',
        '&:hover': { bgcolor: '#f5f5f5', borderColor: '#90caf9', boxShadow: 4 },
      }}
    >
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item>
          <Avatar sx={{
            width: 80, height: 80, borderRadius: '50%',
            background: isSelected ? 'linear-gradient(135deg, #1A73E8, #4285F4)' : 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
            color: '#1A73E8'
          }}>
            {doctor.profileImage ? (
              <Box component="img" src={doctor.profileImage} alt={getDoctorName(doctor)} sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <PersonIcon sx={{ fontSize: 40 }} />
            )}
          </Avatar>
        </Grid>
        <Grid item xs>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767' }}>{getDoctorName(doctor)}</Typography>
          <Chip label={doctor.specialty || 'General'} size="small" sx={{ mb: 1, mt: 0.5, bgcolor: '#e3f2fd', color: '#1A73E8', fontWeight: 600 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ color: '#7B809A' }}>{doctor.experience || 0} years exp</Typography>
            <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
              ₦{(doctor.consultationFee || doctor.consultation_fee || 0).toLocaleString()}
            </Typography>
          </Box>
          {serviceNames.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
              {serviceNames.map((name, i) => (
                <Chip key={i} label={name} size="small" sx={{ bgcolor: '#f5f5f5', color: '#757575', height: 22 }} />
              ))}
              {doctor.services?.length > 3 && (
                <Chip label={`+${doctor.services.length - 3} more`} size="small" sx={{ bgcolor: '#f5f5f5', color: '#9e9e9e', height: 22 }} />
              )}
            </Box>
          )}
        </Grid>
        {isSelected && (
          <Grid item>
            <CheckCircleIcon sx={{ color: '#1A73E8', fontSize: 24 }} />
          </Grid>
        )}
      </Grid>
    </Button>
  );
};

// ─────────────────────────────────────────────
// BookingPage Component (Main)
// ─────────────────────────────────────────────
const BookingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { doctors, availableSlots, services, loading, error } = useSelector((state) => state.doctors);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const preDoctorId = searchParams.get('doctorId');
  const preServiceId = searchParams.get('serviceId');

  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All Specialties');
  const [bookingData, setBookingData] = useState({ doctor: null, service: null, date: '', timeSlot: null, notes: '' });
  const [guestInfo, setGuestInfo] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const hasAppliedPreSelection = useRef(false);

  useEffect(() => {
    dispatch(fetchDoctors());
    dispatch(fetchServices());
  }, [dispatch]);

  useEffect(() => {
    if (bookingData.doctor && bookingData.date) {
      setSlotsLoading(true);
      dispatch(fetchAvailableSlots({ doctorId: getId(bookingData.doctor), date: bookingData.date }))
        .finally(() => setSlotsLoading(false));
    }
  }, [dispatch, bookingData.doctor, bookingData.date]);

  useEffect(() => {
    if (hasAppliedPreSelection.current) return;
    if (doctors.length === 0 && services.length === 0) return;

    hasAppliedPreSelection.current = true;
    let startStep = 1;
    let selectedDoctor = null;
    let selectedService = null;

    if (preDoctorId) selectedDoctor = doctors.find(d => getId(d) === preDoctorId) || null;
    if (preServiceId) selectedService = services.find(s => getId(s) === preServiceId) || null;

    if (selectedDoctor && selectedService) {
      setBookingData({ doctor: selectedDoctor, service: selectedService, date: '', timeSlot: null, notes: '' });
      startStep = 3;
    } else if (selectedDoctor) {
      setBookingData({ doctor: selectedDoctor, service: null, date: '', timeSlot: null, notes: '' });
      startStep = 2;
    } else if (selectedService) {
      setBookingData({ doctor: null, service: selectedService, date: '', timeSlot: null, notes: '' });
      startStep = 1;
    }
    setStep(startStep);
  }, [doctors, services, preDoctorId, preServiceId]);

  const getDoctorServices = () => {
    if (!bookingData.doctor) return services;
    const doctorServiceIds = bookingData.doctor.services?.map(s => getId(s)) || [];
    if (doctorServiceIds.length > 0) return services.filter(s => doctorServiceIds.includes(getId(s)));
    return services;
  };

  const doctorServices = getDoctorServices();

  const filteredDoctors = doctors.filter(doctor => {
    const name = getDoctorName(doctor).toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'All Specialties' || doctor.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  const handleDoctorSelect = (doctor) => {
    const prevService = bookingData.service;
    const doctorServiceIds = doctor.services?.map(s => getId(s)) || [];
    const serviceStillValid = prevService && doctorServiceIds.includes(getId(prevService));
    setBookingData({ ...bookingData, doctor, service: serviceStillValid ? prevService : null, timeSlot: null, date: '' });
    setStep(2);
  };

  const handleServiceSelect = (service) => {
    setBookingData({ ...bookingData, service });
    setStep(3);
  };

  const handleDateChange = (e) => {
    setBookingData({ ...bookingData, date: e.target.value, timeSlot: null });
  };

  const handleTimeSelect = (slot) => {
    setBookingData({ ...bookingData, timeSlot: typeof slot === 'string' ? slot : slot.start_time });
  };

  const handleNextToInfo = () => setStep(4);
  const handleNextToConfirm = () => setStep(5);

  const handleBookAndSave = async () => {
    setBooking(true);
    try {
      const timeSlot = typeof bookingData.timeSlot === 'string' ? bookingData.timeSlot : bookingData.timeSlot?.start_time;
      const [hours, minutes] = timeSlot.split(':');
      const endHour = parseInt(hours) + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;

      await api.post('/appointments', {
        doctor: getId(bookingData.doctor),
        service: getId(bookingData.service),
        date: bookingData.date,
        startTime: timeSlot,
        endTime,
        notes: bookingData.notes,
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
      });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterLoading(true);
    try {
      const result = await dispatch(register(registerForm));
      if (register.fulfilled.match(result)) navigate('/dashboard');
      else setRegisterError(result.payload || 'Registration failed. Please try again.');
    } catch (err) {
      setRegisterError(err.message || 'Registration failed. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const stepLabels = ['Doctor', 'Service', 'Schedule', 'Your Info', 'Confirm'];
  const stepIcons = [1, 2, 3, 4, 5];

  // ── Render: Success screen ──
  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Header isMobile={isMobile} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <Container maxWidth="lg" sx={{ py: 8, mt: 4 }}>
          <BookingSuccessPage
            bookingData={bookingData}
            onCreateAccount={() => setIsRegistering(true)}
            onSignIn={() => navigate('/login')}
            onBackHome={() => navigate('/')}
            isRegistering={isRegistering}
            registerForm={registerForm}
            setRegisterForm={setRegisterForm}
            handleRegister={handleRegister}
            registerLoading={registerLoading}
            registerError={registerError}
          />
        </Container>
      </Box>
    );
  }

  // ── Render: Main booking wizard ──
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Header isMobile={isMobile} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <HeroSection />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Stepper */}
        <Paper sx={{ borderRadius: 3, p: { xs: 2, sm: 3 }, mb: 4, bgcolor: '#fff' }}>
          <Stepper activeStep={step - 1} alternativeLabel connector={<ColorlibConnector />}>
            {stepLabels.map((label, i) => (
              <Step key={label}>
                <StepLabel StepIconComponent={ColorlibStepIcon} icon={stepIcons[i]}>
                  <Typography variant="body2" sx={{ fontWeight: step >= i + 1 ? 600 : 400, color: step >= i + 1 ? '#344767' : '#7B809A', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            {error}. Please refresh the page.
          </Alert>
        )}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* ── Step 1: Doctor Selection ── */}
            {step === 1 && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767', mb: 3 }}>Choose Your Doctor</Typography>

                {bookingData.service && (
                  <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}
                    action={
                      <Button size="small" onClick={() => setBookingData({ ...bookingData, service: null })} sx={{ color: '#1A73E8' }}>Clear</Button>
                    }>
                    Pre-selected service: <strong>{bookingData.service.name}</strong> — ₦{(bookingData.service.price || 0).toLocaleString()}
                  </Alert>
                )}

                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      placeholder="Search doctors by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#7B809A' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      fullWidth
                      value={specialtyFilter}
                      onChange={(e) => setSpecialtyFilter(e.target.value)}
                      SelectProps={{ native: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      {specialties.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                {loading ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#1A73E8', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: '#7B809A' }}>Loading doctors...</Typography>
                  </Box>
                ) : filteredDoctors.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <PersonIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: '#7B809A' }}>No doctors found</Typography>
                    <Typography variant="body2" sx={{ color: '#aaa' }}>Try adjusting your search or filters</Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#7B809A', mb: 2 }}>{filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} available</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {filteredDoctors.map((doctor) => (
                        <DoctorCard
                          key={getId(doctor)}
                          doctor={doctor}
                          isSelected={getId(bookingData.doctor) === getId(doctor)}
                          onSelect={handleDoctorSelect}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* ── Step 2: Service Selection ── */}
            {step === 2 && (
              <Box>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setStep(1)} sx={{ mb: 3, color: '#7B809A', textTransform: 'none' }}>
                  Back to Doctors
                </Button>

                <Paper sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2, mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 48, height: 48, background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', color: '#1A73E8' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#344767' }}>{getDoctorName(bookingData.doctor)}</Typography>
                        <Typography variant="body2" sx={{ color: '#1A73E8' }}>{bookingData.doctor.specialty}</Typography>
                      </Box>
                    </Box>
                    <Button size="small" onClick={() => { setBookingData({ ...bookingData, doctor: null, service: null, timeSlot: null, date: '' }); setStep(1); }}
                      sx={{ color: '#1A73E8', fontWeight: 600 }}>
                      Change Doctor
                    </Button>
                  </Box>
                </Paper>

                <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767', mb: 0.5 }}>Select a Service</Typography>
                <Typography variant="body2" sx={{ color: '#7B809A', mb: 3 }}>Choose from {doctorServices.length} available service{doctorServices.length !== 1 ? 's' : ''}</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {doctorServices.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="body1" sx={{ color: '#7B809A' }}>No services available for this doctor.</Typography>
                    </Box>
                  ) : (
                    doctorServices.map((service) => (
                      <Button
                        key={getId(service)}
                        onClick={() => handleServiceSelect(service)}
                        sx={{
                          width: '100%', p: 3, borderRadius: 2, textAlign: 'left', textTransform: 'none',
                          border: '2px solid',
                          borderColor: getId(bookingData.service) === getId(service) ? '#1A73E8' : '#e0e0e0',
                          bgcolor: getId(bookingData.service) === getId(service) ? '#e3f2fd' : '#fff',
                          '&:hover': { bgcolor: '#f5f5f5', borderColor: '#90caf9', boxShadow: 3 },
                        }}
                      >
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#344767' }}>{service.name}</Typography>
                            <Typography variant="body2" sx={{ color: '#7B809A', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <AccessTimeIcon sx={{ fontSize: 16 }} /> {service.duration} minutes
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50' }}>₦{service.price?.toLocaleString()}</Typography>
                            {getId(bookingData.service) === getId(service) ? (
                              <Typography variant="caption" sx={{ color: '#1A73E8', fontWeight: 600 }}>Selected</Typography>
                            ) : (
                              <Typography variant="caption" sx={{ color: '#aaa' }}>Click to select</Typography>
                            )}
                          </Box>
                        </Box>
                      </Button>
                    ))
                  )}
                </Box>
              </Box>
            )}

            {/* ── Step 3: Date & Time Selection ── */}
            {step === 3 && (
              <Box>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setStep(2)} sx={{ mb: 3, color: '#7B809A', textTransform: 'none' }}>
                  Back to Services
                </Button>

                <Paper sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, mb: 4 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={8}>
                      <Typography variant="body2" sx={{ color: '#7B809A' }}>Doctor: <strong sx={{ color: '#344767' }}>{getDoctorName(bookingData.doctor)}</strong></Typography>
                      <Typography variant="body2" sx={{ color: '#7B809A' }}>Service: <strong sx={{ color: '#344767' }}>{bookingData.service?.name}</strong></Typography>
                    </Grid>
                    <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Button size="small" onClick={() => { setBookingData({ ...bookingData, doctor: null, service: null, timeSlot: null, date: '' }); setStep(1); }} sx={{ color: '#1A73E8', fontWeight: 600 }}>Change</Button>
                    </Grid>
                  </Grid>
                </Paper>

                <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767', mb: 3 }}>Select Date & Time</Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#7B809A', mb: 1 }}>Choose a Date</Typography>
                  <TextField
                    type="date"
                    value={bookingData.date}
                    onChange={handleDateChange}
                    inputProps={{ min: getMinDate() }}
                    sx={{ maxWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>

                {bookingData.date && (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#7B809A', mb: 2 }}>
                      Available Time Slots for {new Date(bookingData.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </Typography>

                    {slotsLoading ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress size={32} sx={{ color: '#1A73E8', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: '#7B809A' }}>Loading available slots...</Typography>
                      </Box>
                    ) : Array.isArray(availableSlots) && availableSlots.length === 0 ? (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        No available slots for this date. Please try another date.
                      </Alert>
                    ) : (
                      <Grid container spacing={1}>
                        {(Array.isArray(availableSlots) ? availableSlots : []).map((slot, index) => (
                          <Grid item xs={4} sm={3} md={2} key={index}>
                            <Button
                              fullWidth
                              onClick={() => handleTimeSelect(slot)}
                              sx={{
                                p: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.875rem',
                                bgcolor: bookingData.timeSlot === (typeof slot === 'string' ? slot : slot.start_time) ? '#1A73E8' : '#f5f5f5',
                                color: bookingData.timeSlot === (typeof slot === 'string' ? slot : slot.start_time) ? '#fff' : '#757575',
                                '&:hover': { bgcolor: bookingData.timeSlot === (typeof slot === 'string' ? slot : slot.start_time) ? '#1557B0' : '#e3f2fd' },
                              }}
                            >
                              {typeof slot === 'string' ? slot : slot.start_time}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                )}

                {bookingData.timeSlot && (
                  <Paper sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2, mt: 4 }}>
                    <Typography variant="body2" sx={{ color: '#1A73E8', mb: 2 }}>
                      <strong>Selected:</strong> {new Date(bookingData.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {bookingData.timeSlot}
                    </Typography>
                    <Button fullWidth variant="contained" size="large" onClick={handleNextToInfo}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
                      Continue to Your Info
                    </Button>
                  </Paper>
                )}
              </Box>
            )}

            {/* ── Step 4: Guest/Patient Information ── */}
            {step === 4 && (
              <Box>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setStep(3)} sx={{ mb: 3, color: '#7B809A', textTransform: 'none' }}>
                  Back to Schedule
                </Button>

                <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767', mb: 0.5 }}>Your Information</Typography>
                <Typography variant="body2" sx={{ color: '#7B809A', mb: 3 }}>Please provide your details for the appointment</Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="First Name" value={guestInfo.firstName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })} placeholder="First name"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Last Name" value={guestInfo.lastName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })} placeholder="Last name"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email Address" type="email" value={guestInfo.email}
                      onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })} placeholder="your@email.com"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Phone Number" type="tel" value={guestInfo.phone}
                      onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })} placeholder="08012345678"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                  </Grid>
                </Grid>

                {guestInfo.firstName && guestInfo.lastName && guestInfo.email && guestInfo.phone && (
                  <Paper sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2, mt: 4 }}>
                    <Typography variant="body2" sx={{ color: '#1A73E8', mb: 2 }}>
                      <strong>Name:</strong> {guestInfo.firstName} {guestInfo.lastName}<br />
                      <strong>Email:</strong> {guestInfo.email}<br />
                      <strong>Phone:</strong> {guestInfo.phone}
                    </Typography>
                    <Button fullWidth variant="contained" size="large" onClick={handleNextToConfirm}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
                      Continue to Confirm
                    </Button>
                  </Paper>
                )}
              </Box>
            )}

            {/* ── Step 5: Confirmation & Booking Submit ── */}
            {step === 5 && (
              <Box>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setStep(4)} sx={{ mb: 3, color: '#7B809A', textTransform: 'none' }}>
                  Back to Your Info
                </Button>

                <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767', mb: 4 }}>Confirm Your Appointment</Typography>

                <Paper sx={{ p: 4, background: 'linear-gradient(135deg, #e3f2fd, #f5f5f5)', borderRadius: 3, mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
                    <Avatar sx={{ width: 64, height: 64, background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', color: '#1A73E8', flexShrink: 0 }}>
                      <PersonIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#344767' }}>{getDoctorName(bookingData.doctor)}</Typography>
                      <Typography variant="body2" sx={{ color: '#1A73E8' }}>{bookingData.doctor.specialty}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ borderTop: '1px solid #bbdefb', pt: 3 }}>
                    {[
                      { icon: <MedicalServicesIcon sx={{ fontSize: 18 }} />, label: 'Service', value: bookingData.service?.name },
                      { icon: <CalendarTodayIcon sx={{ fontSize: 18 }} />, label: 'Date', value: new Date(bookingData.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) },
                      { icon: <AccessTimeIcon sx={{ fontSize: 18 }} />, label: 'Time', value: bookingData.timeSlot },
                      { icon: <PersonIcon sx={{ fontSize: 18 }} />, label: 'Patient', value: `${guestInfo.firstName} ${guestInfo.lastName}` },
                    ].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#7B809A', display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.icon} {item.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#344767' }}>{item.value}</Typography>
                      </Box>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid #bbdefb', mt: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#344767' }}>Total</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#4CAF50' }}>₦{bookingData.service?.price?.toLocaleString()}</Typography>
                    </Box>
                  </Box>
                </Paper>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#7B809A', mb: 1 }}>Additional Notes (Optional)</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    placeholder="Any symptoms, concerns, or special requests..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleBookAndSave}
                  disabled={booking}
                  sx={{
                    borderRadius: 2, textTransform: 'none', fontWeight: 700, py: 1.5, fontSize: '1rem',
                    background: 'linear-gradient(135deg, #1A73E8, #4285F4)',
                    boxShadow: '0 4px 7px -1px rgba(26,115,232,0.3)',
                    '&:hover': { background: 'linear-gradient(135deg, #1557B0, #1A73E8)' },
                  }}
                >
                  {booking ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} sx={{ color: '#fff' }} />
                      Booking...
                    </Box>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 2 }}>
                  <ShieldIcon sx={{ fontSize: 16, color: '#aaa' }} />
                  <Typography variant="caption" sx={{ color: '#aaa' }}>Your information is secure and encrypted</Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default BookingPage;
