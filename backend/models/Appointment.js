const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: String,
    required: [true, 'Please add appointment date (YYYY-MM-DD)']
  },
  timeSlot: {
    type: String,
    required: [true, 'Please add appointment time slot']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  prescription: {
    symptoms: { type: String, default: '' },
    medicines: { type: String, default: '' },
    notes: { type: String, default: '' },
    dateAdded: { type: Date }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
