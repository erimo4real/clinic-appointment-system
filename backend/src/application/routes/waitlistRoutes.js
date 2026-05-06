const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../../infrastructure/middleware/auth');
const Waitlist = require('../../domain/entities/Waitlist');
const Doctor = require('../../domain/entities/Doctor');

router.get('/', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const records = await Waitlist.find()
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const record = await Waitlist.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor');
    if (!record) return res.status(404).json({ message: 'Waitlist entry not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const { patient, patientName, patientPhone, doctor, doctorName, preferredDate, preferredTime, reason, priority, notes } = req.body;
    const record = new Waitlist({ patient, patientName, patientPhone, doctor, doctorName, preferredDate, preferredTime, reason, priority, notes, status: 'waiting' });
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const record = await Waitlist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ message: 'Waitlist entry not found' });
    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await Waitlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Waitlist entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
