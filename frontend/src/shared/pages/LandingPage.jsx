import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../shared/services/api';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';

/**
 * Loading screen shown while page initializes
 */
const LoadingScreen = () => {
  const [dots, setDots] = useState('');
  const [pulse, setPulse] = useState(false);
  
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(d => d.length < 3 ? d + '.' : '');
    }, 400);
    
    const pulseInterval = setInterval(() => {
      setPulse(p => !p);
    }, 800);
    
    return () => {
      clearInterval(dotsInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mb-8">
          <svg 
            className={`w-24 h-24 text-red-500 mx-auto transition-transform duration-300 ${pulse ? 'scale-125' : 'scale-100'}`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
            style={{ filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))' }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <div className={`absolute inset-0 bg-red-400 rounded-full blur-xl opacity-30 transition-opacity duration-300 ${pulse ? 'opacity-60' : 'opacity-30'}`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">MedBook Pro</h2>
        <p className="text-gray-500">Loading{dots}</p>
      </div>
    </div>
  );
};

/**
 * Hero section with main call-to-action
 */
const Hero = ({ doctorCount = 0 }) => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Trusted by {doctorCount > 0 ? `${doctorCount * 100}+` : '10,000+'} Patients
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Your Health, <br />
              <span className="text-blue-600">Our Priority</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Book appointments with top-rated doctors in minutes. Experience modern healthcare that's convenient, reliable, and always available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/booking" className="btn-primary inline-flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Appointment
              </Link>
              <Link to="/#doctors" className="btn-secondary inline-flex items-center justify-center">
                View Doctors
              </Link>
            </div>
            <div className="flex items-center mt-8 space-x-8">
              <div>
                <div className="text-2xl font-bold text-gray-900">{doctorCount > 0 ? doctorCount : '50+'}</div>
                <div className="text-sm text-gray-500">Expert Doctors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{doctorCount > 0 ? doctorCount * 200 : '10K+'}</div>
                <div className="text-sm text-gray-500">Happy Patients</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{doctorCount > 0 ? Math.min(doctorCount, 15) : '15+'}</div>
                <div className="text-sm text-gray-500">Specialties</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl mb-6 flex items-center justify-center">
                <svg className="w-24 h-24 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="flex space-x-2 pt-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg"></div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg"></div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Services section - fetches from API or uses fallback
 */
const Services = ({ services }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const visibleServices = 3;

  // Auto-slide effect
  React.useEffect(() => {
    if (services.length <= visibleServices) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % services.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [services.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % services.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  };

  const getVisibleServices = () => {
    if (services.length === 0) {
      return [
        { icon: '🩺', title: 'General Medicine', description: 'Comprehensive care for common health issues' },
        { icon: '❤️', title: 'Cardiology', description: 'Expert heart care and cardiovascular prevention' },
        { icon: '🦴', title: 'Orthopedics', description: 'Bone, joint, and muscle care' },
      ];
    }
    const result = [];
    for (let i = 0; i < visibleServices; i++) {
      result.push(services[(currentIndex + i) % services.length]);
    }
    return result;
  };

  const visible = getVisibleServices();

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Comprehensive healthcare services for you and your family</p>
        </div>
        
        <div className="relative">
          <div className="grid md:grid-cols-3 gap-8">
            {visible.map((service, index) => (
              <Card key={index} className="hover:border-blue-200 hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">{service.icon || '🏥'}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name || service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                  {service.price && (
                    <p className="text-blue-600 font-semibold mt-2">${service.price}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {services.length > visibleServices && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        {services.length > visibleServices && (
          <div className="flex justify-center mt-8 space-x-2">
            {services.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * Doctors section - fetches from API or uses fallback
 */
const Doctors = ({ doctors }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const visibleDoctors = 4;

  // Auto-slide effect
  React.useEffect(() => {
    if (doctors.length <= visibleDoctors) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % doctors.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [doctors.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % doctors.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + doctors.length) % doctors.length);
  };

  const getVisibleDoctors = () => {
    if (doctors.length === 0) {
      return [
        { name: 'Dr. John Smith', specialty: 'Cardiology', qualification: 'MD, FACC', image: '👨‍⚕️' },
        { name: 'Dr. Sarah Jones', specialty: 'General Medicine', qualification: 'MD, MBBS', image: '👩‍⚕️' },
        { name: 'Dr. David Lee', specialty: 'Pediatrics', qualification: 'MD, FAAP', image: '👨‍⚕️' },
        { name: 'Dr. Emily Brown', specialty: 'Dermatology', qualification: 'MD, FAAD', image: '👩‍⚕️' },
      ];
    }
    const result = [];
    for (let i = 0; i < visibleDoctors; i++) {
      result.push(doctors[(currentIndex + i) % doctors.length]);
    }
    return result;
  };

  const visible = getVisibleDoctors();

  const getDoctorName = (doctor) => {
    if (doctor.user) {
      return `Dr. ${doctor.user.firstName || ''} ${doctor.user.lastName || ''}`.trim();
    }
    return doctor.fullName || doctor.name || 'Doctor';
  };

  return (
    <section id="doctors" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">Our Expert Doctors</h2>
          <p className="section-subtitle">Meet our team of experienced medical professionals</p>
        </div>
        
        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visible.map((doctor, index) => (
              <Card key={index} className="text-center hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                    {doctor.profileImage ? (
                      <img src={doctor.profileImage} alt={getDoctorName(doctor)} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      doctor.image || '👨‍⚕️'
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{getDoctorName(doctor)}</h3>
                  <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                  <p className="text-gray-500 text-sm">{doctor.qualification}</p>
                  {doctor.experience && (
                    <p className="text-gray-400 text-xs mt-1">{doctor.experience} years experience</p>
                  )}
                  <Link to="/booking" className="mt-4 inline-block text-blue-600 font-medium hover:text-blue-700">
                    Book Appointment →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {doctors.length > visibleDoctors && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        {doctors.length > visibleDoctors && (
          <div className="flex justify-center mt-8 space-x-2">
            {doctors.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * About section with benefits
 */
const About = ({ doctorCount = 0 }) => {
  return (
    <section id="about" className="py-20 bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose MedBook Pro?</h2>
            <div className="space-y-6">
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                  <p className="text-white/80">Your medical information is protected with enterprise-grade security</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
                  <p className="text-white/80">Book appointments anytime, anywhere</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Multiple Locations</h3>
                  <p className="text-white/80">Visit any of our conveniently located clinics</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/20 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold">98%</div>
                <div className="text-white/80">Patient Satisfaction</div>
              </div>
              <div className="bg-white/20 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold">15+</div>
                <div className="text-white/80">Years Experience</div>
              </div>
              <div className="bg-white/20 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold">{doctorCount > 0 ? doctorCount : '50+'}</div>
                <div className="text-white/80">Medical Experts</div>
              </div>
              <div className="bg-white/20 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold">24/7</div>
                <div className="text-white/80">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Main Landing Page Component
 * Fetches doctors and services from API
 */
const LandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch doctors and services in parallel
        const [doctorsRes, servicesRes] = await Promise.all([
          api.get('/doctors'),
          api.get('/services')
        ]);

        setDoctors(doctorsRes.data || []);
        setServices(servicesRes.data || []);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
        // Use empty arrays - fallback data will be shown
        setDoctors([]);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Hide loading screen after 2 seconds max
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero doctorCount={doctors.length} />
      <Services services={services} />
      <Doctors doctors={doctors} />
      <About doctorCount={doctors.length} />
      <Footer />
    </div>
  );
};

export default LandingPage;
