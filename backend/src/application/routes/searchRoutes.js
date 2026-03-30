/**
 * =====================================================
 * SEARCH ROUTES
 * =====================================================
 * 
 * HTTP endpoints for searching across the system.
 * 
 * @layer Presentation/Routes
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const User = require('../../domain/entities/User');
const Doctor = require('../../domain/entities/Doctor');
const Service = require('../../domain/entities/Service');
const Appointment = require('../../domain/entities/Appointment');

/**
 * GET /api/search
 * Search across doctors, services, etc.
 */
router.get('/', async (req, res) => {
  try {
    const { q, type } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ results: [] });
    }
    
    const searchRegex = new RegExp(q, 'i');
    const results = [];
    
    if (!type || type === 'doctors') {
      const doctors = await Doctor.find({ 
        $or: [
          { specialty: searchRegex },
          { qualification: searchRegex }
        ],
        isAvailable: true
      }).populate('user', 'firstName lastName').limit(10);
      
      doctors.forEach(d => {
        results.push({
          type: 'doctor',
          id: d._id,
          title: `Dr. ${d.user?.firstName} ${d.user?.lastName}`,
          subtitle: d.specialty
        });
      });
    }
    
    if (!type || type === 'services') {
      const services = await Service.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ],
        isActive: true
      }).limit(10);
      
      services.forEach(s => {
        results.push({
          type: 'service',
          id: s._id,
          title: s.name,
          subtitle: s.description?.substring(0, 50)
        });
      });
    }
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
