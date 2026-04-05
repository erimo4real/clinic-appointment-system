import React from 'react';
import { useToast } from '../../../components/ui/Toast';

const PrintPrescription = ({ prescription, onClose }) => {
  const toast = useToast();

  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
    toast.success('Prescription ready for printing!');
  };

  const handleDownload = () => {
    const content = document.getElementById('prescription-content');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription #${prescription.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #14b8a6; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #14b8a6; margin: 0; }
            .header p { color: #666; margin: 5px 0; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
            th { background: #f9f9f9; }
            .medication-name { font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Prescription #{prescription.id}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div id="prescription-content" className="print-prescription">
            <div className="header">
              <h1 style={{ color: '#14b8a6', fontSize: '28px', marginBottom: '10px' }}>MedBook Pro Clinic</h1>
              <p style={{ color: '#666', margin: '5px 0' }}>123 Medical Avenue, Lagos, Nigeria</p>
              <p style={{ color: '#666', margin: '5px 0' }}>+234 812 345 6789 | contact@medbookpro.com</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <div>
                <p><strong>Patient:</strong> {prescription.patient_name || 'Patient'}</p>
                <p><strong>Date:</strong> {prescription.date}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p><strong>Prescription #:</strong> {prescription.id}</p>
                <p><strong>Doctor:</strong> Dr. {prescription.doctor}</p>
              </div>
            </div>

            <div className="section">
              <h3 style={{ color: '#333', fontSize: '18px', marginBottom: '15px', paddingBottom: '5px', borderBottom: '2px solid #14b8a6' }}>
                Medications
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9f9f9' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Medication</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Dosage</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Frequency</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.medications?.map((med, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>{med.name}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{med.dosage}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{med.frequency}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{med.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {prescription.notes && (
              <div className="section">
                <h3 style={{ color: '#333', fontSize: '16px', marginBottom: '10px' }}>Instructions</h3>
                <p style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', fontStyle: 'italic' }}>
                  {prescription.notes}
                </p>
              </div>
            )}

            <div className="footer">
              <p>This prescription is valid for 30 days from the date of issue.</p>
              <p>Please follow the dosage instructions carefully. Contact us if you experience any side effects.</p>
              <p style={{ marginTop: '20px', fontSize: '14px' }}>
                <strong>Dr. {prescription.doctor}</strong> | Signature: ______________
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .fixed { display: none !important; }
          body { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default PrintPrescription;
