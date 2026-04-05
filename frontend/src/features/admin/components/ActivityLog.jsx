import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import EmptyState from '../../../components/ui/EmptyState';

const ActivityLog = () => {
  const { user } = useSelector((state) => state.auth);
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const sampleActivities = [
      { id: 1, action: 'User Created', description: 'New patient John Doe registered', user: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: 'user' },
      { id: 2, action: 'Appointment Booked', description: 'Appointment for Jane Smith with Dr. Smith confirmed', user: 'Jane Smith', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), type: 'appointment' },
      { id: 3, action: 'Doctor Updated', description: 'Dr. Smith schedule modified', user: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), type: 'doctor' },
      { id: 4, action: 'Service Added', description: 'New service "Dental Checkup" added', user: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), type: 'service' },
      { id: 5, action: 'Appointment Completed', description: 'Follow-up appointment for Bob marked as completed', user: 'Dr. Johnson', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), type: 'appointment' },
      { id: 6, action: 'User Role Changed', description: 'User patient1@example.com role changed to receptionist', user: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: 'user' },
      { id: 7, action: 'Appointment Cancelled', description: 'Appointment for Alice cancelled by patient', user: 'Alice', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), type: 'appointment' },
      { id: 8, action: 'Password Reset', description: 'Password reset requested by user@example.com', user: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), type: 'auth' },
      { id: 9, action: 'Doctor Created', description: 'New doctor Dr. Emily Chen added to system', user: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), type: 'doctor' },
      { id: 10, action: 'Service Updated', description: 'Service "General Consultation" price updated', user: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), type: 'service' },
    ];
    setActivities(sampleActivities);
  }, []);

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getTypeColor = (type) => {
    const colors = {
      user: 'bg-blue-100 text-blue-600',
      appointment: 'bg-purple-100 text-purple-600',
      doctor: 'bg-green-100 text-green-600',
      service: 'bg-orange-100 text-orange-600',
      auth: 'bg-gray-100 text-gray-600',
    };
    return colors[type] || colors.user;
  };

  const getTypeIcon = (type) => {
    const icons = {
      user: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      appointment: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      doctor: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      service: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      auth: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    };
    return icons[type] || icons.user;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-gray-600 mt-1">Track all system activities and changes</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-2 flex-wrap">
            {['all', 'user', 'appointment', 'doctor', 'service', 'auth'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === type
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredActivities.length === 0 ? (
            <EmptyState
              icon="default"
              title="No activities found"
              description="Activity logs will appear here as users interact with the system"
            />
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(activity.type)}`}>
                    {getTypeIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{activity.action}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                        {activity.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{activity.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>By {activity.user}</span>
                      <span>•</span>
                      <span>{formatTime(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
