import React from 'react';
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
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
        <p>&copy; 2024 MedBook Pro. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const DoctorsPage = () => {
  const doctors = [
    { name: 'Dr. Sarah Johnson', specialty: 'Cardiology', qualification: 'MD, FACC', experience: '15 years', image: '👩‍⚕️', bio: 'Dr. Johnson is a board-certified cardiologist with extensive experience in preventive cardiology and heart failure management.' },
    { name: 'Dr. Michael Chen', specialty: 'Neurology', qualification: 'MD, PhD', experience: '12 years', image: '👨‍⚕️', bio: 'Specializing in stroke prevention and treatment, Dr. Chen brings cutting-edge research to patient care.' },
    { name: 'Dr. Emily Williams', specialty: 'Pediatrics', qualification: 'MD, FAAP', experience: '10 years', image: '👩‍⚕️', bio: 'Dr. Williams is passionate about child health and development, providing comprehensive pediatric care.' },
    { name: 'Dr. James Brown', specialty: 'Orthopedics', qualification: 'MD, FAAOS', experience: '18 years', image: '👨‍⚕️', bio: 'An expert in sports medicine and joint replacement, Dr. Brown has helped thousands of patients regain mobility.' },
    { name: 'Dr. Lisa Anderson', specialty: 'Ophthalmology', qualification: 'MD, FACS', experience: '14 years', image: '👩‍⚕️', bio: 'Dr. Anderson specializes in cataract surgery and laser vision correction with exceptional outcomes.' },
    { name: 'Dr. Robert Martinez', specialty: 'General Medicine', qualification: 'MD', experience: '20 years', image: '👨‍⚕️', bio: 'A compassionate physician focused on preventive care and chronic disease management.' },
    { name: 'Dr. Jennifer Lee', specialty: 'Dermatology', qualification: 'MD, FAAD', experience: '11 years', image: '👩‍⚕️', bio: 'Dr. Lee provides comprehensive skin care, from acne treatment to skin cancer screening.' },
    { name: 'Dr. David Wilson', specialty: 'Internal Medicine', qualification: 'MD, FACP', experience: '16 years', image: '👨‍⚕️', bio: 'Specializing in adult medicine with a focus on wellness and disease prevention.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-gradient-to-r from-medical-600 to-primary-600 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Our Expert Doctors</h1>
          <p className="text-xl text-white/80">Meet our team of experienced medical professionals</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {doctors.map((doctor, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-medical-100 to-primary-100 p-8 flex items-center justify-center">
                <span className="text-7xl">{doctor.image}</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{doctor.name}</h3>
                <p className="text-medical-600 font-medium mb-1">{doctor.specialty}</p>
                <p className="text-gray-500 text-sm mb-3">{doctor.qualification}</p>
                <p className="text-gray-600 text-sm mb-4">{doctor.bio}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{doctor.experience} experience</span>
                  <Link to="/booking" className="text-medical-600 font-medium hover:underline">
                    Book Appointment →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DoctorsPage;
