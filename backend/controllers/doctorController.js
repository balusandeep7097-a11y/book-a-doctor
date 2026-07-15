const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all doctors (with filters)
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = async (req, res) => {
  try {
    const { specialty, minExperience, maxFee, search, status } = req.query;
    
    let query = {};

    // By default, show approved doctors to patients/visitors
    if (status) {
      query.verificationStatus = status;
    } else {
      query.verificationStatus = 'approved';
    }

    if (specialty) {
      const specialtiesArray = specialty.split(',');
      query.specialty = { $in: specialtiesArray };
    }

    if (minExperience) {
      query.experience = { $gte: Number(minExperience) };
    }

    if (maxFee) {
      query.fee = { ...query.fee, $lte: Number(maxFee) };
    }

    let doctors = await Doctor.find(query).populate('user', 'name email avatar role');

    // If search term is present, filter by doctor name, specialty, or clinic address
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      doctors = doctors.filter(doc => 
        (doc.user && searchRegex.test(doc.user.name)) ||
        searchRegex.test(doc.specialty) ||
        searchRegex.test(doc.clinicAddress)
      );
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single doctor profile
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email avatar role');

    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update doctor profile (for logged-in doctor)
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
exports.updateDoctorProfile = async (req, res) => {
  try {
    let doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    }

    const { specialty, experience, fee, bio, clinicAddress, availability } = req.body;

    // Update fields
    if (specialty) doctor.specialty = specialty;
    if (experience !== undefined) doctor.experience = experience;
    if (fee !== undefined) doctor.fee = fee;
    if (bio !== undefined) doctor.bio = bio;
    if (clinicAddress) doctor.clinicAddress = clinicAddress;
    if (availability) doctor.availability = availability;

    await doctor.save();

    const updatedDoctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email avatar role');

    res.status(200).json({
      success: true,
      data: updatedDoctor
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Verify/Approve doctor application
// @route   PUT /api/doctors/:id/verify
// @access  Private (Admin only)
exports.verifyDoctor = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid verification status' });
    }

    let doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found' });
    }

    doctor.verificationStatus = status;
    await doctor.save();

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
