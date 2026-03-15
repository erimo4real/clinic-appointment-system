import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
          <h4 className="text-white font-semibold mb-4">Services</h4>
          <ul className="space-y-2">
            <li><span className="hover:text-white">General Medicine</span></li>
            <li><span className="hover:text-white">Cardiology</span></li>
            <li><span className="hover:text-white">Pediatrics</span></li>
            <li><span className="hover:text-white">Orthopedics</span></li>
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
        <p>&copy; 2024 MedBook Pro. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const ServicesPage = () => {
  const services = [
    { icon: '🩺', title: 'General Medicine', description: 'Comprehensive care for common health issues and routine checkups. Our experienced physicians provide preventive care, diagnosis, and treatment for a wide range of medical conditions.', price: 'From $80' },
    { icon: '❤️', title: 'Cardiology', description: 'Expert heart care and cardiovascular disease prevention. Our cardiologists offer advanced diagnostics, treatment plans, and ongoing management for heart conditions.', price: 'From $150' },
    { icon: '🦴', title: 'Orthopedics', description: 'Bone, joint, and muscle care from specialists. We provide treatment for sports injuries, arthritis, and musculoskeletal disorders with cutting-edge techniques.', price: 'From $180' },
    { icon: '👶', title: 'Pediatrics', description: 'Healthcare services for infants, children, and adolescents. Our pediatric team ensures your children receive the best care in a comfortable environment.', price: 'From $100' },
    { icon: '🧠', title: 'Neurology', description: 'Brain and nervous system disorder treatment. Our neurologists diagnose and treat conditions affecting the brain, spine, and nervous system.', price: 'From $200' },
    { icon: '👁️', title: 'Ophthalmology', description: 'Complete eye care and vision correction services. From routine eye exams to advanced surgical procedures, we care for your vision.', price: 'From $120' },
    { icon: '🦷', title: 'Dental Care', description: 'Comprehensive dental services including preventive care, fillings, extractions, and cosmetic dentistry for the whole family.', price: 'From $75' },
    { icon: '🧪', title: 'Laboratory', description: 'Full range of diagnostic tests and laboratory services. Quick and accurate results for better healthcare decisions.', price: 'From $50' },
  ];

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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-medical-600 font-semibold">{service.price}</span>
                <Link to="/booking" className="text-medical-600 font-medium hover:underline">
                  Book Now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServicesPage;
