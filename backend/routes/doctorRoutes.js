const express = require('express');
const {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
  verifyDoctor
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.put('/:id/verify', protect, authorize('admin'), verifyDoctor);

module.exports = router;
