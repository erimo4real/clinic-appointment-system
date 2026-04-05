import React, { useState } from 'react';
import { useToast } from '../../../components/ui/Toast';
import EmptyState from '../../../components/ui/EmptyState';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const PrescriptionPage = () => {
  const toast = useToast();
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, date: '2024-01-20', doctor: 'Dr. Smith', medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days' },
    ], notes: 'Take with food. Monitor blood pressure daily.' },
    { id: 2, date: '2024-02-10', doctor: 'Dr. Johnson', medications: [
      { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' },
    ], notes: 'Complete full course of antibiotics.' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [viewPrescription, setViewPrescription] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: '',
  });

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedication = (index) => {
    const newMeds = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: newMeds });
  };

  const updateMedication = (index, field, value) => {
    const newMeds = [...formData.medications];
    newMeds[index][field] = value;
    setFormData({ ...formData, medications: newMeds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPrescription = {
      id: Date.now(),
      ...formData,
    };
    setPrescriptions([newPrescription, ...prescriptions]);
    toast.success('Prescription created successfully!');
    setShowModal(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      doctor: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      notes: '',
    });
  };

  const handleDelete = () => {
    setPrescriptions(prescriptions.filter(p => p.id !== deleteId));
    toast.success('Prescription deleted successfully!');
    setDeleteId(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-600 mt-1">View and manage prescriptions</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Prescription
        </button>
      </div>

      <div className="space-y-4">
        {prescriptions.length === 0 ? (
          <EmptyState
            icon="default"
            title="No prescriptions"
            description="Your prescriptions will appear here"
          />
        ) : (
          prescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Prescription #{prescription.id}</h3>
                        <p className="text-sm text-gray-500">Dr. {prescription.doctor}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{prescription.date}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      {prescription.medications.length} medication{prescription.medications.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="pb-2">Medication</th>
                        <th className="pb-2">Dosage</th>
                        <th className="pb-2">Frequency</th>
                        <th className="pb-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {prescription.medications.map((med, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          <td className="py-2 font-medium">{med.name}</td>
                          <td className="py-2">{med.dosage}</td>
                          <td className="py-2">{med.frequency}</td>
                          <td className="py-2">{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {prescription.notes && (
                  <p className="text-sm text-gray-600 italic mb-4">Note: {prescription.notes}</p>
                )}

                <div className="flex gap-2">
                  <button onClick={() => setViewPrescription(prescription)} className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                    Print
                  </button>
                  <button onClick={() => setDeleteId(prescription.id)} className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Prescription</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                  <input type="text" value={formData.doctor} onChange={(e) => setFormData({ ...formData, doctor: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Medications</label>
                  <button type="button" onClick={addMedication} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                    + Add Medication
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.medications.map((med, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          placeholder="Medication name"
                          value={med.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Dosage (e.g., 10mg)"
                          value={med.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Frequency"
                          value={med.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                          required
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Duration"
                            value={med.duration}
                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            required
                          />
                          {formData.medications.length > 1 && (
                            <button type="button" onClick={() => removeMedication(index)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none h-20" placeholder="Additional instructions..." />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Create Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Prescription"
        message="Are you sure you want to delete this prescription?"
        type="danger"
      />
    </div>
  );
};

export default PrescriptionPage;
