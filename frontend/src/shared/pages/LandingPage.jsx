import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors } from '../../features/doctors/store/doctorSlice';
import { fetchAllServices } from '../../features/admin/store/adminSlice';

const LoadingScreen = () => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length < 3 ? d + '.' : '');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
          <svg className="w-12 h-12 lg:w-14 lg:h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">MedBook Pro</h2>
        <p className="text-gray-500">Loading{dots}</p>
      </div>
    </div>
  );
};

const NavIcon = ({ name, className }) => {
  const icons = {
    menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    location: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    arrow: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />,
    arrowLeft: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[name]}</svg>;
};

const EmptyState = ({ icon, title, message }) => (
  <div className="bg-gray-50 rounded-xl p-8 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <NavIcon name={icon} className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm">{message}</p>
  </div>
);

const LandingPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { doctors, loading: doctorsLoading } = useSelector((state) => state.doctors);
  const { services, loading: servicesLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          dispatch(fetchDoctors()),
          dispatch(fetchAllServices())
        ]);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  if (loading) return <LoadingScreen />;

  const doctorCount = doctors.length;
  const specialtyCount = [...new Set(doctors.map(d => d.specialty))].length;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">MedBook Pro</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/services" className="text-gray-600 hover:text-teal-600 transition-colors">Services</Link>
              <Link to="/doctors" className="text-gray-600 hover:text-teal-600 transition-colors">Doctors</Link>
              <Link to="/login" className="px-4 py-2 text-teal-600 font-medium hover:text-teal-700">Sign In</Link>
              <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all">Get Started</Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
              <NavIcon name={mobileMenuOpen ? 'arrowLeft' : 'menu'} className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-600">Services</Link>
            <Link to="/doctors" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-600">Doctors</Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-teal-600 font-medium">Sign In</Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-center font-medium rounded-xl">Get Started</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-16 lg:pb-24 bg-gradient-to-br from-teal-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                Trusted Healthcare Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Your Health, <br />
                <span className="text-teal-600">Our Priority</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-lg">
                Book appointments with top-rated doctors in minutes. Experience modern healthcare that's convenient, reliable, and always available.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/booking" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all">
                  <NavIcon name="calendar" className="w-5 h-5" />
                  Book Appointment
                </Link>
                <Link to="/doctors" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                  View Doctors
                  <NavIcon name="arrow" className="w-5 h-5" />
                </Link>
              </div>
              <div className="flex items-center gap-6 lg:gap-8 mt-10">
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900">{doctorCount > 0 ? doctorCount : '0'}</div>
                  <div className="text-sm text-gray-500">Expert Doctors</div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900">{doctorCount * 50}+</div>
                  <div className="text-sm text-gray-500">Happy Patients</div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900">{specialtyCount > 0 ? specialtyCount : '0'}</div>
                  <div className="text-sm text-gray-500">Specialties</div>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute -top-8 -left-8 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
              <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <NavIcon name="user" className="w-10 h-10 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">Book an Appointment</h3>
                <p className="text-gray-500 text-center mb-6">Schedule a visit with our specialists</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <NavIcon name="star" className="w-5 h-5 text-amber-500" />
                    <span className="text-gray-700">Top-rated doctors</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <NavIcon name="check" className="w-5 h-5 text-teal-500" />
                    <span className="text-gray-700">Easy online booking</span>
                  </div>
                  <Link to="/booking" className="block w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-center font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Comprehensive healthcare services for you and your family</p>
          </div>
          
          {services.length === 0 ? (
            <EmptyState 
              icon="calendar" 
              title="No Services Available at the Moment" 
              message="Please check back later." 
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {services.slice(0, 6).map((service, i) => (
                <div key={service.id || service._id || i} className="bg-white rounded-2xl p-6 lg:p-8 hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-4">
                    <NavIcon name="calendar" className="w-7 h-7 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.description || 'Professional healthcare service'}</p>
                  <p className="text-teal-600 font-semibold">₦{(service.price || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
          
          {services.length > 0 && (
            <div className="text-center mt-8">
              <Link to="/services" className="inline-flex items-center gap-2 px-6 py-3 text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                View All Services
                <NavIcon name="arrow" className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Doctors Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Expert Doctors</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Meet our team of experienced medical professionals</p>
          </div>
          
          {doctors.length === 0 ? (
            <EmptyState 
              icon="users" 
              title="No Doctors Available at the Moment" 
              message="Please check back later." 
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {doctors.slice(0, 4).map((doctor, i) => (
                <div key={doctor.id || doctor._id || i} className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:shadow-lg hover:border-teal-100 transition-all">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {doctor.profileImage ? (
                      <img src={doctor.profileImage} alt={`Dr. ${doctor.user?.firstName}`} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <NavIcon name="user" className="w-12 h-12 text-teal-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Dr. {doctor.user?.firstName || ''} {doctor.user?.lastName || ''}
                  </h3>
                  <p className="text-teal-600 font-medium">{doctor.specialty}</p>
                  {doctor.experience && (
                    <p className="text-gray-400 text-sm mt-1">{doctor.experience} years experience</p>
                  )}
                  <Link to="/booking" className="mt-4 inline-flex items-center gap-1 text-teal-600 font-medium hover:text-teal-700">
                    Book <NavIcon name="arrow" className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}

          {doctors.length > 0 && (
            <div className="text-center mt-8">
              <Link to="/doctors" className="inline-flex items-center gap-2 px-6 py-3 text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                View All Doctors
                <NavIcon name="arrow" className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Why Choose MedBook Pro?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <NavIcon name="shield" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Secure & Private</h3>
                    <p className="text-white/80">Your medical information is protected with enterprise-grade security</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <NavIcon name="clock" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">24/7 Availability</h3>
                    <p className="text-white/80">Book appointments anytime, anywhere</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <NavIcon name="location" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Multiple Locations</h3>
                    <p className="text-white/80">Visit any of our conveniently located clinics</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-white/80">Patient Satisfaction</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">{specialtyCount > 0 ? specialtyCount : '0'}+</div>
                <div className="text-white/80">Specialties</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">{doctorCount > 0 ? doctorCount : '0'}</div>
                <div className="text-white/80">Medical Experts</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-white/80">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <span className="text-xl font-bold">MedBook Pro</span>
            </div>
            <p className="text-gray-400 text-sm">© 2024 MedBook Pro. Clinic Appointment Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
