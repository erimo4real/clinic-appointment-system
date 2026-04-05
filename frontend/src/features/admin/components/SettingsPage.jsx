import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useToast } from '../../../components/ui/Toast';

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('clinic');
  const [clinicInfo, setClinicInfo] = useState({
    name: 'MedBook Pro Clinic',
    phone: '+234 812 345 6789',
    email: 'contact@medbookpro.com',
    address: '123 Medical Avenue, Lagos, Nigeria',
  });
  const [workingHours, setWorkingHours] = useState({
    monday: { start: '08:00', end: '18:00', enabled: true },
    tuesday: { start: '08:00', end: '18:00', enabled: true },
    wednesday: { start: '08:00', end: '18:00', enabled: true },
    thursday: { start: '08:00', end: '18:00', enabled: true },
    friday: { start: '08:00', end: '18:00', enabled: true },
    saturday: { start: '09:00', end: '14:00', enabled: true },
    sunday: { start: '09:00', end: '14:00', enabled: false },
  });
  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    emailReminders: true,
    smsReminders: false,
    dailySummary: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Settings saved successfully!');
    setSaving(false);
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const tabs = [
    { id: 'clinic', label: 'Clinic Info', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'hours', label: 'Working Hours', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'account', label: 'Account', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your clinic settings and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-100 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-6">
            {activeTab === 'clinic' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Clinic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                    <input
                      type="text"
                      value={clinicInfo.name}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={clinicInfo.phone}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={clinicInfo.email}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={clinicInfo.address}
                      onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hours' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Working Hours</h2>
                <div className="space-y-3">
                  {days.map((day) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-28">
                        <span className="font-medium text-gray-700 capitalize">{day}</span>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={workingHours[day].enabled}
                          onChange={(e) => setWorkingHours({
                            ...workingHours,
                            [day]: { ...workingHours[day], enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-500">Open</span>
                      </label>
                      {workingHours[day].enabled && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={workingHours[day].start}
                            onChange={(e) => setWorkingHours({
                              ...workingHours,
                              [day]: { ...workingHours[day], start: e.target.value }
                            })}
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                          />
                          <span className="text-gray-400">to</span>
                          <input
                            type="time"
                            value={workingHours[day].end}
                            onChange={(e) => setWorkingHours({
                              ...workingHours,
                              [day]: { ...workingHours[day], end: e.target.value }
                            })}
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'emailAppointments', label: 'Email notifications for new appointments' },
                    { key: 'emailReminders', label: 'Email reminders for upcoming appointments' },
                    { key: 'smsReminders', label: 'SMS reminders for appointments' },
                    { key: 'dailySummary', label: 'Daily summary email' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="text-gray-700">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Account Settings</h2>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-2xl font-bold">
                      {user?.first_name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user?.first_name} {user?.last_name}</p>
                      <p className="text-gray-500">{user?.email}</p>
                      <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded mt-1 capitalize">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        defaultValue={user?.first_name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        defaultValue={user?.last_name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        defaultValue={user?.phone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
