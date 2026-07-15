const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialty: {
    type: String,
    required: [true, 'Please add a specialty'],
    enum: [
      'Cardiologist',
      'Dermatologist',
      'Pediatrician',
      'General Practitioner',
      'Neurologist',
      'Orthopedic',
      'Psychiatrist',
      'Dentist',
      'Anesthesiology',
      'Bariatrics',
      'Cardiac Sciences',
      'Cosmetology & Plastic Surgery',
      'Critical Care',
      'Critical Care & Emergency Medicine',
      'Dentistry',
      'Dermatology',
      'Dietician and Nutrition'
    ],
    default: 'General Practitioner'
  },
  experience: {
    type: Number,
    required: [true, 'Please add years of experience']
  },
  fee: {
    type: Number,
    required: [true, 'Please add consultation fee']
  },
  bio: {
    type: String,
    default: ''
  },
  clinicAddress: {
    type: String,
    required: [true, 'Please add clinic address']
  },
  rating: {
    type: Number,
    default: 4.8
  },
  reviewsCount: {
    type: Number,
    default: 15
  },
  availability: [
    {
      day: {
        type: String,
        required: true
      },
      slots: {
        type: [String],
        default: []
      }
    }
  ],
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
