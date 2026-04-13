import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPatientFeedback, submitFeedback, clearSubmitSuccess } from '../../feedback/store/feedbackSlice';
import { fetchMyAppointments, cancelAppointment, updateAppointment } from '../../appointments/store/appointmentSlice';
import { updateProfile } from '../../auth/store/authSlice';
import UserLayout from './UserLayout';

const NavIcon = ({ name, className }) => {
  const icons = {
    star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    printer: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    thumbUp: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[name]}</svg>;
};

const StarRating = ({ rating, onChange, readonly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} type="button" disabled={readonly} onClick={() => onChange && onChange(star)} className={`text-xl ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} ${star <= rating ? 'text-amber-400' : 'text-gray-300'} transition-transform`}>
        ★
      </button>
    ))}
  </div>
);

const PrintAppointment = ({ appointment, onClose }) => {
  if (!appointment) return null;
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md print:shadow-none print:p-0" id="print-appointment">
        <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4 print:border-black">
          <h2 className="text-2xl font-bold text-teal-600 print:text-black">MedBook Pro</h2>
          <p className="text-gray-500 text-sm">Appointment Confirmation</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Patient:</span>
            <span className="font-medium">{appointment.patient_name || 'Patient'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Doctor:</span>
            <span className="font-medium">Dr. {appointment.doctor_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service:</span>
            <span className="font-medium">{appointment.service_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date:</span>
            <span className="font-medium">{appointment.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Time:</span>
            <span className="font-medium">{appointment.start_time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status:</span>
            <span className="font-medium capitalize">{appointment.status}</span>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-xl print:bg-white">
          <p className="text-sm text-gray-500 text-center">
            Please arrive 15 minutes before your appointment time.
          </p>
        </div>
        
        <div className="mt-6 flex gap-3 print:hidden">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium">Close</button>
          <button onClick={handlePrint} className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium">Print</button>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
  </div>
);

const EmptyState = ({ icon, title, description }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <NavIcon name={icon} className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);

const StatCard = ({ title, value, icon, gradient }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gradient}`}>
        {icon}
      </div>
    </div>
  </div>
);

const PatientProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { patientFeedback, loading: feedbackLoading, submitSuccess } = useSelector((state) => state.feedback);
  const { appointments, loading: appointmentsLoading } = useSelector((state) => state.appointments);

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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const openCancelModal = (apt) => {
    setSelectedAppointment(apt);
    setShowCancelModal(true);
  };

  const openRescheduleModal = (apt) => {
    setSelectedAppointment(apt);
    setNewDate(apt.date);
    setNewTime(apt.start_time);
    setShowRescheduleModal(true);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    setActionLoading(true);
    try {
      const appointmentId = selectedAppointment._id || selectedAppointment.id;
      await dispatch(cancelAppointment(appointmentId)).unwrap();
      dispatch(fetchMyAppointments());
      setShowCancelModal(false);
    } catch (error) {
      console.error('Cancel failed:', error);
    }
    setActionLoading(false);
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !newDate || !newTime) return;
    setActionLoading(true);
    try {
      const appointmentId = selectedAppointment._id || selectedAppointment.id;
      await dispatch(updateAppointment({
        id: appointmentId,
        date: newDate,
        startTime: newTime,
        endTime: newTime.split(':')[0] + ':30',
      })).unwrap();
      dispatch(fetchMyAppointments());
      setShowRescheduleModal(false);
    } catch (error) {
      console.error('Reschedule failed:', error);
    }
    setActionLoading(false);
  };
  
  const myAppointments = appointments || [];
  const upcomingAppointments = myAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const pastAppointments = myAppointments
    .filter(a => a.status === 'completed' || a.status === 'cancelled')
    .filter(a => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        (a.doctor_name || '').toLowerCase().includes(query) ||
        (a.service_name || '').toLowerCase().includes(query) ||
        (a.date || '').toLowerCase().includes(query)
      );
    });

  const getStatusBadge = (status) => {
    const variants = { 
      pending: 'bg-amber-100 text-amber-700', 
      confirmed: 'bg-blue-100 text-blue-700', 
      completed: 'bg-emerald-100 text-emerald-700', 
      cancelled: 'bg-rose-100 text-rose-700' 
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  return (
    <UserLayout activeTab={activeTab} onTabChange={setActiveTab} title="My Profile" subtitle="Manage your profile and view your appointments">
      <div className="space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                title="Upcoming"
                value={upcomingAppointments.length}
                gradient="bg-blue-100"
                icon={<NavIcon name="calendar" className="w-6 h-6 text-blue-600" />}
              />
              <StatCard
                title="Completed"
                value={pastAppointments.length}
                gradient="bg-emerald-100"
                icon={<NavIcon name="check" className="w-6 h-6 text-emerald-600" />}
              />
              <StatCard
                title="Feedback"
                value={patientFeedback.length}
                gradient="bg-purple-100"
                icon={<NavIcon name="thumbUp" className="w-6 h-6 text-purple-600" />}
              />
            </div>
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-4 lg:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Personal Information</h2>
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
              >
                <NavIcon name="edit" className="w-4 h-4" /> 
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={profileData.first_name} 
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })} 
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" 
                  />
                ) : (
                  <p className="text-gray-900">{user?.firstName || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={profileData.last_name} 
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })} 
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" 
                  />
                ) : (
                  <p className="text-gray-900">{user?.lastName || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{user?.email || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={profileData.phone} 
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} 
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" 
                  />
                ) : (
                  <p className="text-gray-900">{user?.phone || '-'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                <p className="text-gray-900 capitalize">{user?.role || '-'}</p>
              </div>
            </div>
            {isEditing && (
              <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                <button 
                  onClick={handleProfileUpdate} 
                  className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium"
                >
                  Save Changes
                </button>
              </div>
            )}
          </>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {appointmentsLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {upcomingAppointments.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
                    <div className="grid gap-4">
                      {upcomingAppointments.map((apt) => (
                        <div key={apt.id || apt._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <NavIcon name="calendar" className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Dr. {apt.doctor_name}</p>
                                <p className="text-sm text-gray-500">{apt.service_name}</p>
                                <p className="text-sm text-gray-500">{apt.date} at {apt.start_time}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                              {getStatusBadge(apt.status)}
                              <button 
                                onClick={() => { setSelectedAppointment(apt); setShowPrintModal(true); }} 
                                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                title="Print"
                              >
                                <NavIcon name="printer" className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => openRescheduleModal(apt)} 
                                className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                              >
                                Reschedule
                              </button>
                              <button 
                                onClick={() => openCancelModal(apt)} 
                                className="px-3 py-1.5 text-sm bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Past Appointments</h2>
                    <div className="relative w-full sm:w-64">
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm" 
                      />
                      <NavIcon name="search" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  {pastAppointments.length === 0 ? (
                    <EmptyState 
                      icon={searchQuery ? "search" : "calendar"} 
                      title={searchQuery ? 'No appointments found' : 'No past appointments'} 
                      description={searchQuery ? 'Try adjusting your search' : 'Your completed appointments will appear here'} 
                    />
                  ) : (
                    <div className="grid gap-4">
                      {pastAppointments.map((apt) => (
                        <div key={apt.id || apt._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <NavIcon name="check" className="w-6 h-6 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Dr. {apt.doctor_name}</p>
                                <p className="text-sm text-gray-500">{apt.service_name}</p>
                                <p className="text-sm text-gray-500">{apt.date} at {apt.start_time}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(apt.status)}
                              {apt.status === 'completed' && (
                                <button 
                                  onClick={() => openFeedbackModal(apt.doctor_id, apt.doctor_name)} 
                                  className="block mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                                >
                                  Give Feedback
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">My Feedback History</h2>
            {feedbackLoading ? (
              <LoadingSpinner />
            ) : patientFeedback.length === 0 ? (
              <EmptyState icon="thumbUp" title="No feedback yet" description="Your feedback for doctors will appear here" />
            ) : (
              <div className="grid gap-4">
                {patientFeedback.map((fb) => (
                  <div key={fb.id || fb._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900">Dr. {fb.doctor_name}</p>
                        <p className="text-sm text-gray-500">{fb.doctor_specialty}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <StarRating rating={fb.rating} readonly />
                        </div>
                        {fb.reason && <p className="mt-2 text-gray-700 text-sm">{fb.reason}</p>}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${fb.status === 'reviewed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {fb.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Feedback for Dr. {feedbackForm.doctor_name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <StarRating rating={feedbackForm.rating} onChange={(rating) => setFeedbackForm({ ...feedbackForm, rating })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <textarea 
                  value={feedbackForm.reason} 
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, reason: e.target.value })} 
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none" 
                  placeholder="Share your experience..." 
                  required 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowFeedbackModal(false)} className="px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium">Cancel</button>
                <button 
                  onClick={handleSubmitFeedback} 
                  disabled={feedbackLoading || !feedbackForm.reason} 
                  className="px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium disabled:opacity-50"
                >
                  {feedbackLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <NavIcon name="close" className="w-8 h-8 text-rose-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Cancel Appointment?</h2>
              <p className="text-gray-600">Are you sure you want to cancel your appointment with <strong>Dr. {selectedAppointment.doctor_name}</strong> on <strong>{selectedAppointment.date}</strong>?</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCancelModal(false)} 
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
              >
                Keep
              </button>
              <button 
                onClick={handleCancelAppointment} 
                disabled={actionLoading} 
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Reschedule Appointment</h2>
            <p className="text-gray-600 mb-4">Current: {selectedAppointment.date} at {selectedAppointment.start_time}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                <input 
                  type="date" 
                  value={newDate} 
                  onChange={(e) => setNewDate(e.target.value)} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>
                <select 
                  value={newTime} 
                  onChange={(e) => setNewTime(e.target.value)} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                >
                  <option value="">Select time</option>
                  <option value="08:00">08:00 AM</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowRescheduleModal(false)} 
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRescheduleAppointment} 
                  disabled={actionLoading || !newDate || !newTime} 
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {actionLoading ? 'Rescheduling...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {showPrintModal && <PrintAppointment appointment={selectedAppointment} onClose={() => setShowPrintModal(false)} />}
    </UserLayout>
  );
};

export default PatientProfile;
