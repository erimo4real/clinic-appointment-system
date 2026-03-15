import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDoctorFeedback, respondToFeedback } from '../../feedback/store/feedbackSlice';
import { fetchDoctorAppointments } from '../../appointments/store/appointmentSlice';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
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
  const { doctorFeedback, doctorStats, loading } = useSelector((state) => state.feedback);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Doctor Header */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-600">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dr. {user?.firstName} {user?.lastName}</h1>
                <p className="text-gray-600">{currentDoctor?.specialty}</p>
                <p className="text-sm text-gray-500">{currentDoctor?.qualification}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          {['overview', 'patients', 'feedback'].map((tab) => (
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-4xl font-bold text-blue-600">{completedAppointments.length}</p>
                <p className="text-gray-600">Total Patients</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <div className="flex justify-center">
                  <StarRating rating={parseFloat(doctorStats?.averageRating || 0)} />
                </div>
                <p className="text-gray-600 mt-2">Average Rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-4xl font-bold text-green-600">{doctorStats?.likes || 0}</p>
                <p className="text-gray-600">Total Likes</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{currentDoctor?.bio || 'No bio available'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-gray-700"><span className="font-medium">Email:</span> {user?.email}</p>
                <p className="text-gray-700"><span className="font-medium">Phone:</span> {user?.phone || '-'}</p>
                <p className="text-gray-700"><span className="font-medium">Experience:</span> {currentDoctor?.experience || 0} years</p>
                <p className="text-gray-700"><span className="font-medium">Fee:</span> ${currentDoctor?.consultation_fee}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Patient Records</h2>
            {myAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No patients yet
                </CardContent>
              </Card>
            ) : (
              myAppointments.map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{apt.patient_name}</p>
                        <p className="text-sm text-gray-500">{apt.service_name}</p>
                        <p className="text-sm text-gray-500">
                          {apt.date} at {apt.start_time}
                        </p>
                        {apt.notes && (
                          <p className="text-sm text-gray-600 mt-1">Notes: {apt.notes}</p>
                        )}
                      </div>
                      <Badge variant={
                        apt.status === 'completed' ? 'success' :
                        apt.status === 'pending' ? 'warning' :
                        apt.status === 'cancelled' ? 'destructive' : 'secondary'
                      }>
                        {apt.status}
                      </Badge>
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
            <h2 className="text-lg font-semibold">Patient Feedback</h2>
            
            {doctorStats && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="py-4 text-center">
                    <p className="text-2xl font-bold">{doctorStats.total}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{doctorStats.likes}</p>
                    <p className="text-sm text-gray-600">Likes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{doctorStats.dislikes}</p>
                    <p className="text-sm text-gray-600">Dislikes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{doctorStats.pending}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {doctorFeedback.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No feedback yet
                </CardContent>
              </Card>
            ) : (
              doctorFeedback.map((fb) => (
                <Card key={fb.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{fb.patient_name}</p>
                          <Badge variant={fb.type === 'like' ? 'success' : 'destructive'}>
                            {fb.type === 'like' ? '👍 Like' : '👎 Dislike'}
                          </Badge>
                          <StarRating rating={fb.rating} readonly />
                        </div>
                        <p className="mt-2 text-gray-700">{fb.reason}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4">
                        {respondingTo === fb.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              placeholder="Your response..."
                              className="w-64 h-24 px-2 py-1 border rounded text-sm"
                            />
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={() => handleRespond(fb.id)}>
                                Submit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setRespondingTo(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRespondingTo(fb.id)}
                          >
                            {fb.response ? 'Edit Response' : 'Respond'}
                          </Button>
                        )}
                        {fb.response && !respondingTo && (
                          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <p className="font-medium">Your response:</p>
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
    </div>
  );
};

export default DoctorProfile;
