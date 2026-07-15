const express = require('express');
const {
  bookAppointment,
  getAppointments,
  updateAppointmentStatus,
  addPrescription,
  sendAppointmentEmail
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All appointment routes require authentication

router.post('/', authorize('patient'), bookAppointment);
router.get('/', getAppointments);
router.put('/:id/status', updateAppointmentStatus);
router.post('/:id/prescription', authorize('doctor'), addPrescription);
router.post('/:id/send-email', sendAppointmentEmail);

module.exports = router;
