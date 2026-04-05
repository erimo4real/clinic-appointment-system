const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE',
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'VIEW',
      'EXPORT',
    ],
  },
  entity: {
    type: String,
    required: true,
    enum: [
      'User',
      'Doctor',
      'Appointment',
      'Service',
      'Prescription',
      'MedicalRecord',
      'Payment',
      'System',
    ],
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  description: {
    type: String,
    required: true,
  },
  changes: {
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
  },
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
});

auditLogSchema.index({ user: 1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
