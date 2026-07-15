const Document = require('../models/Document');
const Doctor = require('../models/Doctor');
const path = require('path');
const fs = require('fs');

// @desc    Upload medical document
// @route   POST /api/documents/upload
// @access  Private (Patient only)
exports.uploadDocument = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, error: 'Only patients can upload documents' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const { doctorId } = req.body;
    let doctor = null;

    if (doctorId) {
      doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor not found' });
      }
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const document = await Document.create({
      patient: req.user._id,
      doctor: doctorId || null,
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      fileType: req.file.mimetype
    });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user medical documents
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res) => {
  try {
    let documents;

    if (req.user.role === 'patient') {
      documents = await Document.find({ patient: req.user._id })
        .populate({
          path: 'doctor',
          populate: {
            path: 'user',
            select: 'name'
          }
        })
        .sort('-uploadedAt');
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor profile not found' });
      }
      documents = await Document.find({ doctor: doctor._id })
        .populate('patient', 'name email')
        .sort('-uploadedAt');
    } else if (req.user.role === 'admin') {
      documents = await Document.find()
        .populate('patient', 'name email')
        .populate({
          path: 'doctor',
          populate: {
            path: 'user',
            select: 'name'
          }
        })
        .sort('-uploadedAt');
    }

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete medical document
// @route   DELETE /api/documents/:id
// @access  Private (Patient only)
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Check ownership
    if (document.patient.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this document' });
    }

    // Try deleting local file
    const filePath = path.join(__dirname, '..', document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
