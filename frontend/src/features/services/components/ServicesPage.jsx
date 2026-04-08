import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://clinic-appointment-system-88np.onrender.com';

const NavIcon = ({ name, className }) => {
  const icons = {
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    arrowRight: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    heart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
    medical: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[name]}</svg>;
};

const getServiceIcon = (serviceName) => {
  const name = (serviceName || '').toLowerCase();
  if (name.includes('cardiac') || name.includes('heart')) return 'heart';
  if (name.includes('pediatric') || name.includes('child')) return 'user';
  if (name.includes('general') || name.includes('consultation')) return 'medical';
  return 'medical';
};

const Header = () => (
  <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">MedBook Pro</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-teal-600 transition-colors">Home</Link>
          <Link to="/services" className="text-teal-600 font-medium">Services</Link>
          <Link to="/doctors" className="text-gray-600 hover:text-teal-600 transition-colors">Doctors</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Sign In</Link>
          <Link to="/booking" className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all">Book Appointment</Link>
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-white">MedBook Pro</span>
          </div>
          <p className="text-sm">Your trusted partner in modern healthcare management.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
            <li><Link to="/doctors" className="hover:text-white transition-colors">Doctors</Link></li>
            <li><Link to="/booking" className="hover:text-white transition-colors">Book Now</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Our Services</h4>
          <ul className="space-y-2">
            {services.slice(0, 4).map((service, index) => (
              <li key={index}><Link to="/services" className="hover:text-white transition-colors">{service.name || 'Service'}</Link></li>
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
            <li>+234 801 234 5678</li>
            <li>contact@medbookpro.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
        <p>© {new Date().getFullYear()} MedBook Pro. All rights reserved.</p>
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
        const response = await fetch(API_URL + '/api/services');
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Our Medical Services</h1>
          <p className="text-lg lg:text-xl text-white/80">Comprehensive healthcare solutions for you and your family</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8">
            Unable to load services. Please try again later.
          </div>
        )}
        
        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services available at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Please check back later.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service) => (
              <div key={service._id || service.id} className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 hover:shadow-lg hover:border-teal-100 transition-all">
                <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-4">
                  <NavIcon name={getServiceIcon(service.name)} className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-teal-600 font-semibold">
                    ₦{(service.price || 0).toLocaleString()}
                  </span>
                  <Link to="/booking" className="flex items-center gap-1 text-teal-600 font-medium hover:text-teal-700">
                    Book <NavIcon name="arrowRight" className="w-4 h-4" />
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
