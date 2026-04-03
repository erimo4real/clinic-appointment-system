import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const getApiUrl = () => {
  const base = process.env.REACT_APP_API_URL || 'https://clinic-appointment-system-88np.onrender.com';
  return base.replace(/\/$/, '') + '/api';
};

const API_URL = getApiUrl();

const Header = () => (
  <header className="bg-white shadow-sm sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-2">
          <svg className="w-10 h-10 text-medical-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span className="text-xl font-bold text-gray-900">MedBook Pro</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-600 hover:text-medical-600 transition-colors">Home</Link>
          <Link to="/services" className="text-gray-600 hover:text-medical-600 transition-colors">Services</Link>
          <Link to="/doctors" className="text-gray-600 hover:text-medical-600 transition-colors">Doctors</Link>
          <Link to="/about" className="text-gray-600 hover:text-medical-600 transition-colors">About</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-medical-600 transition-colors font-medium">
            Sign In
          </Link>
          <Link to="/booking" className="bg-medical-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-medical-700 transition-colors">
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-12">
    <div className="max-w-7xl mx-auto px-4">
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} MedBook Pro. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const AboutPage = () => {
  const [stats, setStats] = useState({
    doctors: 0,
    services: 0,
    specialties: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [doctorsRes, servicesRes] = await Promise.all([
          fetch(API_URL + '/doctors').then(r => r.json()),
          fetch(API_URL + '/services').then(r => r.json())
        ]);

        const doctors = Array.isArray(doctorsRes) ? doctorsRes : [];
        const services = Array.isArray(servicesRes) ? servicesRes : [];
        const specialties = [...new Set(doctors.map(d => d.specialty).filter(Boolean))];

        setStats({
          doctors: doctors.length,
          services: services.length,
          specialties: specialties.length
        });
      } catch (err) {
      }
    };

    fetchStats();
  }, []);

  const features = [
    { icon: '🛡️', title: 'Secure & Private', description: 'Your medical information is protected with enterprise-grade security and encryption.' },
    { icon: '⏰', title: '24/7 Availability', description: 'Book appointments anytime, anywhere through our easy-to-use platform.' },
    { icon: '📍', title: 'Multiple Locations', description: 'Visit any of our conveniently located clinics across the city.' },
    { icon: '👨‍⚕️', title: 'Expert Doctors', description: 'Our team of specialists are dedicated to providing the best care possible.' },
    { icon: '💬', title: 'Easy Communication', description: 'Direct messaging with your healthcare providers for quick consultations.' },
    { icon: '📋', title: 'Medical Records', description: 'Access your complete medical history and test results anytime.' },
  ];

  const displayStats = [
    { value: stats.doctors > 0 ? `${stats.doctors}+` : '50+', label: 'Expert Doctors' },
    { value: stats.doctors > 0 ? `${stats.doctors * 200}+` : '10K+', label: 'Happy Patients' },
    { value: stats.specialties > 0 ? `${stats.specialties}+` : '15+', label: 'Specialties' },
    { value: '98%', label: 'Patient Satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-gradient-to-r from-medical-600 to-primary-600 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">About MedBook Pro</h1>
          <p className="text-xl text-white/80">Your trusted partner in modern healthcare</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              At MedBook Pro, we believe that quality healthcare should be accessible to everyone. 
              Our mission is to revolutionize the way people interact with healthcare services 
              by providing a seamless, technology-driven platform that connects patients with 
              expert medical professionals.
            </p>
            <p className="text-gray-600 mb-6">
              We've helped thousands of patients book appointments with our 
              network of specialist doctors across multiple medical disciplines. Our platform 
              makes it easy to find the right doctor, book appointments, and manage your health.
            </p>
            <Link to="/booking" className="inline-block bg-medical-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-medical-700 transition-colors">
              Book Your First Appointment
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {displayStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="text-3xl font-bold text-medical-600 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose MedBook Pro?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-medical-600 to-primary-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/80 mb-8">Join thousands of satisfied patients who trust MedBook Pro for their healthcare needs.</p>
          <div className="flex justify-center space-x-4">
            <Link to="/booking" className="bg-white text-medical-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Book Appointment
            </Link>
            <Link to="/doctors" className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
              View Doctors
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
