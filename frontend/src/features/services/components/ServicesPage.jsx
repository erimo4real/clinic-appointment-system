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

const Footer = ({ services = [] }) => (
  <footer className="bg-gray-900 text-gray-400 py-12">
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-8 h-8 text-medical-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="text-lg font-bold text-white">MedBook Pro</span>
          </div>
          <p className="text-sm">Your trusted partner in modern healthcare management.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/services" className="hover:text-white">Services</Link></li>
            <li><Link to="/doctors" className="hover:text-white">Doctors</Link></li>
            <li><Link to="/booking" className="hover:text-white">Book Now</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Our Services</h4>
          <ul className="space-y-2">
            {services.slice(0, 4).map((service, index) => (
              <li key={index}>
                <Link to="/services" className="hover:text-white">
                  {service.name || 'Service'}
                </Link>
              </li>
            ))}
            {services.length === 0 && (
              <>
                <li><span className="hover:text-white">General Medicine</span></li>
                <li><span className="hover:text-white">Cardiology</span></li>
                <li><span className="hover:text-white">Pediatrics</span></li>
                <li><span className="hover:text-white">Orthopedics</span></li>
              </>
            )}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>123 Medical Center Dr</li>
            <li>(555) 123-4567</li>
            <li>contact@medbookpro.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} MedBook Pro. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(API_URL + '/services');
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getIcon = (serviceName) => {
    const name = (serviceName || '').toLowerCase();
    if (name.includes('cardiac') || name.includes('heart')) return '❤️';
    if (name.includes('pediatric') || name.includes('child')) return '👶';
    if (name.includes('ortho') || name.includes('bone') || name.includes('joint')) return '🦴';
    if (name.includes('neuro') || name.includes('brain')) return '🧠';
    if (name.includes('derma') || name.includes('skin')) return '🧴';
    if (name.includes('ophthal') || name.includes('eye')) return '👁️';
    if (name.includes('dental') || name.includes('tooth')) return '🦷';
    if (name.includes('lab') || name.includes('blood') || name.includes('test')) return '🧪';
    if (name.includes('x-ray') || name.includes('imaging') || name.includes('radio')) return '📷';
    if (name.includes('physical') || name.includes('annual')) return '🩺';
    return '🏥';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-gradient-to-r from-medical-600 to-primary-600 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Our Medical Services</h1>
          <p className="text-xl text-white/80">Comprehensive healthcare solutions for you and your family</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
            Unable to load services. Please try again later.
          </div>
        )}
        
        {services.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services available at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Please check back later.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service._id || service.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
                <div className="text-5xl mb-4">{getIcon(service.name)}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-medical-600 font-semibold">
                    {service.price ? `$${service.price}` : 'Contact for price'}
                  </span>
                  <Link to="/booking" className="text-medical-600 font-medium hover:underline">
                    Book Now →
                  </Link>
                </div>
                {service.duration && (
                  <p className="text-gray-400 text-sm mt-2">
                    Duration: {service.duration} minutes
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer services={services} />
    </div>
  );
};

export default ServicesPage;
