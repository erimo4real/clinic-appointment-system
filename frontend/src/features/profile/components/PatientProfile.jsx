import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPatientFeedback, submitFeedback, clearSubmitSuccess } from '../../feedback/store/feedbackSlice';
import { fetchMyAppointments } from '../../appointments/store/appointmentSlice';
import { updateProfile } from '../../auth/store/authSlice';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

const StarRating = ({ rating, onChange, readonly = false }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          className={`text-2xl ${readonly ? 'cursor-default' : 'cursor-pointer'} ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const PatientProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { patientFeedback, loading, submitSuccess, error } = useSelector((state) => state.feedback);
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
    doctor_id: '',
    doctor_name: '',
    rating: 5,
    type: 'like',
    reason: '',
  });

  useEffect(() => {
    dispatch(fetchPatientFeedback());
    dispatch(fetchMyAppointments());
  }, [dispatch]);

  useEffect(() => {
    if (submitSuccess) {
      setShowFeedbackModal(false);
      setFeedbackForm({
        doctor_id: '',
        doctor_name: '',
        rating: 5,
        type: 'like',
        reason: '',
      });
      dispatch(clearSubmitSuccess());
      dispatch(fetchPatientFeedback());
    }
  }, [submitSuccess, dispatch]);

  const handleProfileUpdate = () => {
    dispatch(updateProfile(profileData));
    setIsEditing(false);
  };

  const openFeedbackModal = (doctorId, doctorName) => {
    setFeedbackForm({
      doctor_id: doctorId,
      doctor_name: doctorName,
      rating: 5,
      type: 'like',
      reason: '',
    });
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = () => {
    dispatch(submitFeedback(feedbackForm));
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'info',
      completed: 'success',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const myAppointments = appointments || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          {['profile', 'appointments', 'feedback'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-4 capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Personal Information
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  {isEditing ? (
                    <Input
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{user?.firstName || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  {isEditing ? (
                    <Input
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{user?.lastName || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{user?.phone || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <p className="text-gray-900 capitalize">{user?.role}</p>
                </div>
              </div>
              {isEditing && (
                <div className="mt-6">
                  <Button onClick={handleProfileUpdate}>Save Changes</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Appointment History</h2>
            {myAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No appointments yet
                </CardContent>
              </Card>
            ) : (
              myAppointments.map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{apt.doctor_name}</p>
                      <p className="text-sm text-gray-500">{apt.service_name}</p>
                      <p className="text-sm text-gray-500">
                        {apt.date} at {apt.start_time}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(apt.status)}
                      {apt.status === 'completed' && (
                        <button
                          onClick={() => openFeedbackModal(apt.doctor_id, apt.doctor_name)}
                          className="ml-4 text-sm text-blue-600 hover:underline"
                        >
                          Give Feedback
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">My Feedback History</h2>
            {patientFeedback.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No feedback given yet
                </CardContent>
              </Card>
            ) : (
              patientFeedback.map((fb) => (
                <Card key={fb.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Dr. {fb.doctor_name}</p>
                        <p className="text-sm text-gray-500">{fb.doctor_specialty}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant={fb.type === 'like' ? 'success' : 'destructive'}>
                            {fb.type === 'like' ? '👍 Like' : '👎 Dislike'}
                          </Badge>
                          <StarRating rating={fb.rating} readonly />
                        </div>
                        <p className="mt-2 text-gray-700">{fb.reason}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={fb.status === 'reviewed' ? 'success' : 'warning'}>
                          {fb.status}
                        </Badge>
                        {fb.response && (
                          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <p className="font-medium">Doctor's response:</p>
                            <p>{fb.response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Give Feedback for Dr. {feedbackForm.doctor_name}</h2>
            
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <StarRating
                  rating={feedbackForm.rating}
                  onChange={(rating) => setFeedbackForm({ ...feedbackForm, rating })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setFeedbackForm({ ...feedbackForm, type: 'like' })}
                    className={`flex-1 py-2 rounded-lg border-2 ${
                      feedbackForm.type === 'like'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200'
                    }`}
                  >
                    👍 Like
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackForm({ ...feedbackForm, type: 'dislike' })}
                    className={`flex-1 py-2 rounded-lg border-2 ${
                      feedbackForm.type === 'dislike'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200'
                    }`}
                  >
                    👎 Dislike
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (will be sent to admin)
                </label>
                <textarea
                  value={feedbackForm.reason}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, reason: e.target.value })}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Share your experience..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowFeedbackModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitFeedback} disabled={loading || !feedbackForm.reason}>
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
