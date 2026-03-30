import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://clinic-appointment-system-88np.onrender.com';

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

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(API_URL + '/doctors');
        const doctorsData = await response.json();
        setDoctors(doctorsData || []);
        
        const uniqueSpecialties = [...new Set(doctorsData.map(d => d.specialty).filter(Boolean))];
        setSpecialties(uniqueSpecialties);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const getDoctorName = (doctor) => {
    if (doctor.user) {
      const firstName = doctor.user.firstName || '';
      const lastName = doctor.user.lastName || '';
      const name = `${firstName} ${lastName}`.trim();
      return name ? `Dr. ${name}` : 'Doctor';
    }
    return doctor.fullName || doctor.name || 'Doctor';
  };

  const filteredDoctors = selectedSpecialty
    ? doctors.filter(d => d.specialty === selectedSpecialty)
    : doctors;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
            Unable to load doctors. Please try again later.
          </div>
        )}

        {/* Specialty Filter */}
        {specialties.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSpecialty('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedSpecialty === ''
                  ? 'bg-medical-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Specialties
            </button>
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSpecialty === specialty
                    ? 'bg-medical-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        )}

        {filteredDoctors.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No doctors available at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Please check back later.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDoctors.map((doctor) => (
              <div key={doctor._id || doctor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-br from-medical-100 to-primary-100 p-8 flex items-center justify-center">
                  {doctor.profileImage ? (
                    <img 
                      src={doctor.profileImage} 
                      alt={getDoctorName(doctor)} 
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <span className="text-7xl">👨‍⚕️</span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{getDoctorName(doctor)}</h3>
                  <p className="text-medical-600 font-medium mb-1">{doctor.specialty}</p>
                  <p className="text-gray-500 text-sm mb-3">{doctor.qualification}</p>
                  {doctor.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{doctor.bio}</p>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {doctor.experience ? `${doctor.experience} years experience` : 'Experience available'}
                    </span>
                    <Link 
                      to="/booking" 
                      state={{ doctorId: doctor._id || doctor.id }}
                      className="text-medical-600 font-medium hover:underline"
                    >
                      Book Appointment →
                    </Link>
                  </div>
                  {doctor.consultationFee && (
                    <div className="mt-3 text-medical-600 font-semibold">
                      Consultation: ${doctor.consultationFee}
                    </div>
                  )}
                  {doctor.user?.phone && (
                    <div className="mt-2 text-gray-500 text-sm">
                      {doctor.user.phone}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default DoctorsPage;
