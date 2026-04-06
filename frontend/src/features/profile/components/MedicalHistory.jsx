import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../components/ui/Toast';
import EmptyState from '../../../components/ui/EmptyState';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const MedicalHistory = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const [records, setRecords] = useState([
    { id: 1, date: '2024-01-15', type: 'diagnosis', title: 'General Checkup', description: 'Routine annual checkup. All vitals normal.', doctor: 'Dr. Smith', attachments: [] },
    { id: 2, date: '2024-01-20', type: 'prescription', title: 'Blood Pressure Medication', description: 'Lisinopril 10mg daily', doctor: 'Dr. Johnson', attachments: [] },
    { id: 3, date: '2024-02-05', type: 'lab', title: 'Blood Test Results', description: 'Cholesterol levels normal. Blood sugar within range.', doctor: 'Dr. Smith', attachments: [] },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'diagnosis',
    title: '',
    description: '',
    doctor: '',
    attachments: [],
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    const uploadedUrls = [];
    
    for (const file of files) {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);
      
      try {
        const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://clinic-appointment-system-88np.onrender.com/api'}/upload/medical`, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formDataUpload,
          credentials: 'include',
        });
        const data = await response.json();
        if (data.secure_url) {
          uploadedUrls.push({ name: file.name, url: data.secure_url });
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
    
    setFormData({ ...formData, attachments: [...formData.attachments, ...uploadedUrls] });
    setUploading(false);
    if (uploadedUrls.length > 0) {
      toast.success(`${uploadedUrls.length} file(s) uploaded!`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newRecord = {
      id: Date.now(),
      date: formData.date,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      doctor: formData.doctor,
      attachments: formData.attachments,
    };
    setRecords([newRecord, ...records]);
    toast.success('Medical record added successfully!');
    setShowModal(false);
    setFormData({ date: new Date().toISOString().split('T')[0], type: 'diagnosis', title: '', description: '', doctor: '', attachments: [] });
  };

  const handleDelete = () => {
    setRecords(records.filter(r => r.id !== deleteId));
    toast.success('Record deleted successfully!');
    setDeleteId(null);
  };

  const getTypeBadge = (type) => {
    const variants = {
      diagnosis: 'bg-blue-100 text-blue-800',
      prescription: 'bg-green-100 text-green-800',
      lab: 'bg-purple-100 text-purple-800',
      surgery: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${variants[type] || variants.other}`}>{type}</span>;
  };

  const getTypeIcon = (type) => {
    const icons = {
      diagnosis: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
      prescription: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
      lab: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />,
      surgery: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    };
    return icons[type] || icons.diagnosis;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
          <p className="text-gray-600 mt-1">View and manage your medical records</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Record
        </button>
      </div>

      <div className="space-y-4">
        {records.length === 0 ? (
          <EmptyState
            icon="default"
            title="No medical records"
            description="Your medical history will appear here"
            actionLabel="Add First Record"
            onAction={() => setShowModal(true)}
          />
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {getTypeIcon(record.type)}
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{record.title}</h3>
                    {getTypeBadge(record.type)}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{record.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {record.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {record.doctor}
                    </span>
                  </div>
                </div>
                <button onClick={() => setDeleteId(record.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Medical Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
                  <option value="diagnosis">Diagnosis</option>
                  <option value="prescription">Prescription</option>
                  <option value="lab">Lab Results</option>
                  <option value="surgery">Surgery</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                <input type="text" value={formData.doctor} onChange={(e) => setFormData({ ...formData, doctor: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none h-24" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Documents (Lab results, prescriptions, etc.)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-500 transition-colors">
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileUpload} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                    ) : (
                      <div className="text-gray-500">
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm">Click to upload or drag files here</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
                {formData.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <button type="button" onClick={() => setFormData({ ...formData, attachments: formData.attachments.filter((_, i) => i !== index) })} className="text-red-500 hover:text-red-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Add Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Record"
        message="Are you sure you want to delete this medical record?"
        type="danger"
      />
    </div>
  );
};

export default MedicalHistory;
