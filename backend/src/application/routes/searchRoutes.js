const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { optionalAuth } = require('../../infrastructure/middleware/auth');
const User = require('../../domain/entities/User');
const Doctor = require('../../domain/entities/Doctor');
const Service = require('../../domain/entities/Service');
const Appointment = require('../../domain/entities/Appointment');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { q } = req.query;
    const user = req.user;

    if (!q || q.length < 2) {
      return res.json({ results: { patients: [], doctors: [], appointments: [], services: [] } });
    }

    const searchRegex = new RegExp(q, 'i');
    const results = { patients: [], doctors: [], appointments: [], services: [] };

    if (!user || user.role === 'admin' || user.role === 'receptionist' || user.role === 'doctor') {
      const patients = await User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { username: searchRegex },
          { email: searchRegex },
        ],
        role: 'patient',
      }).select('firstName lastName username email phone profileImage').limit(10);

      results.patients = patients.map(p => ({
        id: p._id.toString(),
        type: 'patient',
        title: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.username,
        subtitle: p.email,
        phone: p.phone,
        profileImage: p.profileImage,
        route: `/dashboard/patients`,
      }));
    }

    if (!user || user.role === 'admin' || user.role === 'receptionist') {
      const doctors = await Doctor.find({
        $or: [
          { name: searchRegex },
          { specialty: searchRegex },
          { qualification: searchRegex },
        ],
      }).populate('user', 'firstName lastName email').limit(10);

      results.doctors = doctors.map(d => ({
        id: d._id.toString(),
        type: 'doctor',
        title: `Dr. ${d.name || `${d.user?.firstName || ''} ${d.user?.lastName || ''}`.trim() || ''}`,
        subtitle: d.specialty || 'General',
        profileImage: d.profileImage,
        route: `/dashboard/doctors`,
      }));
    }

    const appointmentQuery = {
      $or: [
        { patient_name: searchRegex },
        { guestName: searchRegex },
      ],
    };
    if (user?.role === 'patient' && user?.patientId) {
      appointmentQuery.patient = new mongoose.Types.ObjectId(user.patientId);
    }
    if (user?.role === 'doctor') {
      const doctorDoc = await Doctor.findOne({ user: user._id });
      if (doctorDoc) {
        appointmentQuery.doctor = doctorDoc._id;
      }
    }

    if (!user || user.role !== 'patient' || (user?.patientId)) {
      const appointments = await Appointment.find(appointmentQuery)
        .populate('patient', 'firstName lastName')
        .populate('doctor')
        .populate('service', 'name')
        .limit(10);

      results.appointments = appointments.map(a => {
        const patientName = a.patient?.firstName ? `${a.patient.firstName} ${a.patient.lastName}`.trim() : a.patient_name || a.guestName || '';
        const doctorName = a.doctor?.name || (a.doctor?.user?.firstName ? `Dr. ${a.doctor.user.firstName}` : '');
        return {
          id: a._id.toString(),
          type: 'appointment',
          title: `Appointment with ${patientName}`,
          subtitle: `${doctorName} • ${a.date ? new Date(a.date).toLocaleDateString() : ''} ${a.startTime || ''}`,
          status: a.status,
          route: `/dashboard/appointments`,
        };
      });
    }

    if (!user || user.role === 'admin' || user.role === 'receptionist' || user.role === 'doctor') {
      const services = await Service.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
        ],
      }).limit(10);

      results.services = services.map(s => ({
        id: s._id.toString(),
        type: 'service',
        title: s.name,
        subtitle: s.description?.substring(0, 60) || '',
        price: s.price,
        route: `/dashboard/services`,
      }));
    }

    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
