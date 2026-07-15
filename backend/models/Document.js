const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  fileName: {
    type: String,
    required: [true, 'Please add a file name']
  },
  fileUrl: {
    type: String,
    required: [true, 'Please add a file URL']
  },
  fileType: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', DocumentSchema);
