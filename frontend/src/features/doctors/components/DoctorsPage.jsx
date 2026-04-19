import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../../../components/ui/OptimizedImage';

const API_URL = process.env.REACT_APP_API_URL || 'https://clinic-appointment-system-88np.onrender.com';

const NavIcon = ({ name, className }) => {
  const icons = {
    arrowRight: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    heart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[name]}</svg>;
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
          <Link to="/services" className="text-gray-600 hover:text-teal-600 transition-colors">Services</Link>
          <Link to="/doctors" className="text-teal-600 font-medium">Doctors</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">Sign In</Link>
          <Link to="/booking" className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all">Book Appointment</Link>
        </div>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-12">
    <div className="max-w-7xl mx-auto px-4">
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
        <p>© {new Date().getFullYear()} MedBook Pro. All rights reserved.</p>
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
        const response = await fetch(API_URL + '/api/feedback');
        const data = await response.json();
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
        const response = await fetch(API_URL + '/api/doctors');
        const doctorsData = await response.json();
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
    // Handle various API response structures
    const firstName = doctor?.user?.firstName || doctor?.firstName || doctor?.first_name || '';
    const lastName = doctor?.user?.lastName || doctor?.lastName || doctor?.last_name || '';
    const name = `${firstName} ${lastName}`.trim();
    return name ? `Dr. ${name}` : doctor?.fullName || doctor?.name || 'Doctor';
  };
  
  const getDoctorImage = (doctor) => {
    // Check multiple possible locations for profile image
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Our Expert Doctors</h1>
          <p className="text-lg lg:text-xl text-white/80">Meet our team of experienced medical professionals</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8">
            Unable to load doctors. Please try again later.
          </div>
        )}

        {specialties.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSpecialty('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedSpecialty === ''
                  ? 'bg-teal-600 text-white'
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
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        )}

        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No doctors available at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Please check back later.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredDoctors.map((doctor) => {
              const doctorId = doctor._id || doctor.id;
              const rating = doctorRatings[doctorId];
              const avgRating = rating?.avg || 0;
              const ratingCount = rating?.count || 0;
              
              return (
                <div key={doctorId} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-teal-100 transition-all relative">
                  <button
                    onClick={() => toggleFavorite(doctorId)}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${
                      isFavorite(doctorId) 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <NavIcon name="heart" className="w-5 h-5" />
                  </button>
                  <div className="bg-gradient-to-br from-teal-100 to-blue-100 p-8 flex items-center justify-center">
                    {getDoctorImage(doctor) ? (
                      <img 
                        src={getDoctorImage(doctor)}
                        alt={getDoctorName(doctor)}
                        className="w-32 h-32 border-4 border-white shadow-lg object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 border-4 border-white shadow-lg rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                        {getDoctorInitials(doctor)}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{getDoctorName(doctor)}</h3>
                    <p className="text-teal-600 font-medium mb-1">{doctor.specialty || 'General'}</p>
                    <p className="text-gray-500 text-sm mb-3">{doctor.qualification || ''}</p>
                    
                    {avgRating > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <NavIcon 
                              key={star} 
                              name="star" 
                              className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">({ratingCount} reviews)</span>
                      </div>
                    )}
                    
                    {doctor.bio && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{doctor.bio}</p>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        {doctor.experience ? `${doctor.experience} years experience` : 'Experience varies'}
                      </span>
                      <Link 
                        to="/booking" 
                        state={{ doctorId }}
                        className="flex items-center gap-1 text-teal-600 font-medium hover:text-teal-700"
                      >
                        Book <NavIcon name="arrowRight" className="w-4 h-4" />
                      </Link>
                    </div>
                    {doctor.consultationFee && (
                      <div className="mt-3 text-teal-600 font-semibold">
                        Consultation: ₦{doctor.consultationFee?.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default DoctorsPage;
