import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import OptimizedImage from '../../../components/ui/OptimizedImage';

const API_URL = process.env.REACT_APP_API_URL || 'https://clinic-appointment-system-88np.onrender.com/api';

const StarIcon = ({ filled, className }) => (
  <svg className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const StarRating = ({ rating, readonly = false }) => (
  <div className="flex space-x-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <StarIcon key={star} filled={star <= rating} className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />
    ))}
  </div>
);

const DoctorProfilePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const doctorId = id || location.state?.doctorId;
  
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await fetch(`${API_URL}/doctors`);
        const data = await response.json();
        const foundDoctor = Array.isArray(data) ? data.find(d => (d._id || d.id) === doctorId) : null;
        setDoctor(foundDoctor);
        
        // Fetch reviews
        const reviewsRes = await fetch(`${API_URL}/feedback`);
        const reviewsData = await reviewsRes.json();
        if (Array.isArray(reviewsData)) {
          setReviews(reviewsData.filter(r => r.doctor_id === doctorId));
        }
      } catch (err) {
        console.error('Error fetching doctor:', err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Doctor not found</p>
          <Link to="/doctors" className="text-teal-600 hover:underline">Back to Doctors</Link>
        </div>
      </div>
    );
  }

  const getDoctorName = () => {
    if (doctor.user) {
      return `Dr. ${doctor.user.firstName || ''} ${doctor.user.lastName || ''}`.trim();
    }
    return doctor.fullName || doctor.name || 'Doctor';
  };

  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/doctors" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Doctors
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <OptimizedImage
              src={doctor.profileImage}
              alt={getDoctorName()}
              className="w-40 h-40"
              priority={true}
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{getDoctorName()}</h1>
              <p className="text-xl text-teal-100 mb-2">{doctor.specialty}</p>
              <p className="text-teal-100 mb-4">{doctor.qualification}</p>
              
              <div className="flex items-center justify-center md:justify-start gap-4">
                {avgRating > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={Math.round(avgRating)} />
                    <span className="text-white/80">({reviews.length} reviews)</span>
                  </div>
                )}
                <span className="text-white/80">
                  {doctor.experience ? `${doctor.experience} years experience` : 'Experience available'}
                </span>
              </div>
              
              {doctor.consultationFee && (
                <p className="text-2xl font-bold mt-4">₦{doctor.consultationFee?.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
          {['about', 'reviews', 'schedule'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-white text-teal-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">About</h2>
            <p className="text-gray-600 whitespace-pre-line">{doctor.bio || 'No bio available.'}</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Specialty</h3>
                <p className="text-gray-600">{doctor.specialty}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Qualification</h3>
                <p className="text-gray-600">{doctor.qualification}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Experience</h3>
                <p className="text-gray-600">{doctor.experience || '0'} years</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Consultation Fee</h3>
                <p className="text-gray-600">₦{doctor.consultationFee?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
            
            <Link 
              to="/booking" 
              state={{ doctorId }}
              className="mt-6 inline-flex items-center justify-center w-full md:w-auto px-8 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Book Appointment
            </Link>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
                <div>
                  <StarRating rating={Math.round(avgRating)} />
                  <p className="text-gray-500 text-sm mt-1">{reviews.length} reviews</p>
                </div>
              </div>
            </div>
            
            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                No reviews yet. Be the first to review!
              </div>
            ) : (
              reviews.map((review, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <StarRating rating={review.rating || 0} />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      review.type === 'like' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {review.type === 'like' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                        </svg>
                      )}
                      {review.type === 'like' ? 'Helpful' : 'Not Helpful'}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.reason}</p>
                  {review.response && (
                    <div className="mt-4 bg-teal-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-teal-800 mb-1">Doctor's Response:</p>
                      <p className="text-gray-600">{review.response}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Weekly Schedule</h2>
            <div className="space-y-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                const schedule = doctor.schedule?.[day];
                const available = schedule?.available ?? false;
                return (
                  <div key={day} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <span className="font-medium text-gray-900">{day}</span>
                    <div className="text-right">
                      {available ? (
                        <span className="text-green-600">
                          {schedule.start || '09:00'} - {schedule.end || '17:00'}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not Available</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Link 
              to="/booking" 
              state={{ doctorId }}
              className="mt-6 inline-flex items-center justify-center w-full md:w-auto px-8 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Book an Appointment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfilePage;
