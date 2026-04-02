import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPatientFeedback, submitFeedback, clearSubmitSuccess } from '../../feedback/store/feedbackSlice';
import { fetchMyAppointments } from '../../appointments/store/appointmentSlice';
import { updateProfile } from '../../auth/store/authSlice';

const StarRating = ({ rating, onChange, readonly = false }) => (
  <div className="flex space-x-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} type="button" disabled={readonly} onClick={() => onChange && onChange(star)} className={`text-2xl ${readonly ? 'cursor-default' : 'cursor-pointer'} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </button>
    ))}
  </div>
);

const PatientProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { patientFeedback, loading: feedbackLoading, submitSuccess } = useSelector((state) => state.feedback);
  const { appointments } = useSelector((state) => state.appointments);

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user?.firstName || '',
    last_name: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    doctor_id: '', doctor_name: '', rating: 5, type: 'like', reason: '',
  });

  useEffect(() => {
    dispatch(fetchPatientFeedback());
    dispatch(fetchMyAppointments());
  }, [dispatch]);

  useEffect(() => {
    if (submitSuccess) {
      setShowFeedbackModal(false);
      setFeedbackForm({ doctor_id: '', doctor_name: '', rating: 5, type: 'like', reason: '' });
      dispatch(clearSubmitSuccess());
      dispatch(fetchPatientFeedback());
    }
  }, [submitSuccess, dispatch]);

  useEffect(() => {
    if (user) {
      setProfileData({ first_name: user.firstName || '', last_name: user.lastName || '', email: user?.email || '', phone: user?.phone || '' });
    }
  }, [user]);

  const handleProfileUpdate = () => {
    dispatch(updateProfile(profileData));
    setIsEditing(false);
  };

  const openFeedbackModal = (doctorId, doctorName) => {
    setFeedbackForm({ doctor_id: doctorId, doctor_name: doctorName, rating: 5, type: 'like', reason: '' });
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = () => dispatch(submitFeedback(feedbackForm));

  const myAppointments = appointments || [];
  const upcomingAppointments = myAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const pastAppointments = myAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  const getStatusBadge = (status) => {
    const variants = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${variants[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-500">Upcoming</p><p className="text-2xl font-bold text-gray-900 mt-1">{upcomingAppointments.length}</p></div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-500">Completed</p><p className="text-2xl font-bold text-gray-900 mt-1">{pastAppointments.length}</p></div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-500">Feedback Given</p><p className="text-2xl font-bold text-gray-900 mt-1">{patientFeedback.length}</p></div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {['profile', 'appointments', 'feedback'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Personal Information</h2>
              <button onClick={() => setIsEditing(!isEditing)} className="text-teal-600 hover:text-teal-700 font-medium text-sm">{isEditing ? 'Cancel' : 'Edit Profile'}</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                {isEditing ? <input type="text" value={profileData.first_name} onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /> : <p className="text-gray-900">{user?.firstName || '-'}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                {isEditing ? <input type="text" value={profileData.last_name} onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /> : <p className="text-gray-900">{user?.lastName || '-'}</p>}
              </div>
              <div><label className="block text-sm font-medium text-gray-500 mb-1">Email</label><p className="text-gray-900">{user?.email}</p></div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                {isEditing ? <input type="text" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" /> : <p className="text-gray-900">{user?.phone || '-'}</p>}
              </div>
              <div><label className="block text-sm font-medium text-gray-500 mb-1">Role</label><p className="text-gray-900 capitalize">{user?.role}</p></div>
            </div>
            {isEditing && <div className="px-6 pb-6"><button onClick={handleProfileUpdate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium">Save Changes</button></div>}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {upcomingAppointments.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
                <div className="grid gap-4">
                  {upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <div><p className="font-medium text-gray-900">Dr. {apt.doctor_name}</p><p className="text-sm text-gray-500">{apt.service_name}</p><p className="text-sm text-gray-500">{apt.date} at {apt.start_time}</p></div>
                      </div>
                      <div>{getStatusBadge(apt.status)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold mb-4">Past Appointments</h2>
              {pastAppointments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">No past appointments</div>
              ) : (
                <div className="grid gap-4">
                  {pastAppointments.map((apt) => (
                    <div key={apt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div><p className="font-medium text-gray-900">Dr. {apt.doctor_name}</p><p className="text-sm text-gray-500">{apt.service_name}</p><p className="text-sm text-gray-500">{apt.date} at {apt.start_time}</p></div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(apt.status)}
                        {apt.status === 'completed' && <button onClick={() => openFeedbackModal(apt.doctor_id, apt.doctor_name)} className="block mt-2 text-sm text-teal-600 hover:underline">Give Feedback</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">My Feedback History</h2>
            {patientFeedback.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">No feedback given yet</div>
            ) : (
              patientFeedback.map((fb) => (
                <div key={fb.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Dr. {fb.doctor_name}</p>
                      <p className="text-sm text-gray-500">{fb.doctor_specialty}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${fb.type === 'like' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{fb.type === 'like' ? '👍 Like' : '👎 Dislike'}</span>
                        <StarRating rating={fb.rating} readonly />
                      </div>
                      <p className="mt-2 text-gray-700">{fb.reason}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${fb.status === 'reviewed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{fb.status}</span>
                      {fb.response && <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg"><p className="font-medium">Doctor's response:</p><p>{fb.response}</p></div>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Give Feedback for Dr. {feedbackForm.doctor_name}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Rating</label><StarRating rating={feedbackForm.rating} onChange={(rating) => setFeedbackForm({ ...feedbackForm, rating })} /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
                <div className="flex space-x-4">
                  <button type="button" onClick={() => setFeedbackForm({ ...feedbackForm, type: 'like' })} className={`flex-1 py-2 rounded-lg border-2 ${feedbackForm.type === 'like' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}>👍 Like</button>
                  <button type="button" onClick={() => setFeedbackForm({ ...feedbackForm, type: 'dislike' })} className={`flex-1 py-2 rounded-lg border-2 ${feedbackForm.type === 'dislike' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200'}`}>👎 Dislike</button>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Reason</label><textarea value={feedbackForm.reason} onChange={(e) => setFeedbackForm({ ...feedbackForm, reason: e.target.value })} className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg" placeholder="Share your experience..." required /></div>
              <div className="flex justify-end space-x-3 pt-4">
                <button onClick={() => setShowFeedbackModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSubmitFeedback} disabled={feedbackLoading || !feedbackForm.reason} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">{feedbackLoading ? 'Submitting...' : 'Submit Feedback'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
