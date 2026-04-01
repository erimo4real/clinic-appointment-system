import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDoctorFeedback, respondToFeedback } from '../../feedback/store/feedbackSlice';
import { fetchDoctorAppointments } from '../../appointments/store/appointmentSlice';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

const StarRating = ({ rating, readonly = false }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const DoctorProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { doctorFeedback, doctorStats } = useSelector((state) => state.feedback);
  const { appointments } = useSelector((state) => state.appointments);
  const { currentDoctor } = useSelector((state) => state.doctors);

  const [activeTab, setActiveTab] = useState('overview');
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    if (currentDoctor?._id) {
      dispatch(fetchDoctorFeedback(currentDoctor._id));
      dispatch(fetchDoctorAppointments());
    }
  }, [dispatch, currentDoctor]);

  const handleRespond = (feedbackId) => {
    dispatch(respondToFeedback({ feedbackId, response: responseText }));
    setRespondingTo(null);
    setResponseText('');
    if (currentDoctor?._id) {
      dispatch(fetchDoctorFeedback(currentDoctor._id));
    }
  };

  const myAppointments = appointments || [];
  const completedAppointments = myAppointments.filter(a => a.status === 'completed');
  const upcomingAppointments = myAppointments.filter(a => a.status === 'pending' || a.status === 'confirmed');

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'info',
      completed: 'success',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="rounded-xl">
          <CardContent className="py-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dr. {user?.firstName} {user?.lastName}</h1>
                <p className="text-gray-600">{currentDoctor?.specialty}</p>
                <p className="text-sm text-gray-500">{currentDoctor?.qualification}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{upcomingAppointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{completedAppointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                <div className="flex items-center mt-1">
                  <p className="text-2xl font-semibold text-gray-900">{parseFloat(doctorStats?.averageRating || 0).toFixed(1)}</p>
                  <span className="text-yellow-400 ml-1 text-xl">★</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Likes</p>
                <p className="text-2xl font-semibold text-green-600 mt-1">{doctorStats?.likes || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {['overview', 'patients', 'feedback'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{currentDoctor?.bio || 'No bio available'}</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-900">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-gray-900">{user?.phone || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Experience</span>
                  <span className="text-gray-900">{currentDoctor?.experience || 0} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Consultation Fee</span>
                  <span className="text-gray-900">₦{currentDoctor?.consultation_fee?.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Patient Records</h2>
            {myAppointments.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-8 text-center text-gray-500">
                  No patients yet
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myAppointments.map((apt) => (
                  <Card key={apt.id} className="rounded-xl">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{apt.patient_name}</p>
                            <p className="text-sm text-gray-500">{apt.service_name}</p>
                            <p className="text-sm text-gray-500">{apt.date} at {apt.start_time}</p>
                            {apt.notes && <p className="text-sm text-gray-600 mt-1">Notes: {apt.notes}</p>}
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Patient Feedback</h2>
            
            {doctorStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="rounded-xl">
                  <CardContent className="py-4 text-center">
                    <p className="text-2xl font-semibold">{doctorStats.total}</p>
                    <p className="text-sm text-gray-500">Total</p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl">
                  <CardContent className="py-4 text-center">
                    <p className="text-2xl font-semibold text-green-600">{doctorStats.likes}</p>
                    <p className="text-sm text-gray-500">Likes</p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl">
                  <CardContent className="py-4 text-center">
                    <p className="text-2xl font-semibold text-red-600">{doctorStats.dislikes}</p>
                    <p className="text-sm text-gray-500">Dislikes</p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl">
                  <CardContent className="py-4 text-center">
                    <p className="text-2xl font-semibold text-yellow-600">{doctorStats.pending}</p>
                    <p className="text-sm text-gray-500">Pending</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {doctorFeedback.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-8 text-center text-gray-500">
                  No feedback yet
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {doctorFeedback.map((fb) => (
                  <Card key={fb.id} className="rounded-xl">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{fb.patient_name}</p>
                            <Badge variant={fb.type === 'like' ? 'success' : 'destructive'}>
                              {fb.type === 'like' ? '👍 Like' : '👎 Dislike'}
                            </Badge>
                            <StarRating rating={fb.rating} readonly />
                          </div>
                          <p className="mt-2 text-gray-700">{fb.reason}</p>
                          <p className="text-sm text-gray-500 mt-1">{new Date(fb.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="ml-4">
                          {respondingTo === fb.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Your response..."
                                className="w-64 h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <div className="flex space-x-2">
                                <Button size="sm" onClick={() => handleRespond(fb.id)}>Submit</Button>
                                <Button size="sm" variant="outline" onClick={() => setRespondingTo(null)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => setRespondingTo(fb.id)}>
                              {fb.response ? 'Edit Response' : 'Respond'}
                            </Button>
                          )}
                          {fb.response && !respondingTo && (
                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              <p className="font-medium">Your response:</p>
                              <p>{fb.response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
