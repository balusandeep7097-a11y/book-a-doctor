const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, role, specialty, experience, fee, clinicAddress } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role: role || 'patient'
    });

    // If role is doctor, create a doctor profile
    if (user.role === 'doctor') {
      await Doctor.create({
        user: user._id,
        specialty: specialty || 'General Practitioner',
        experience: experience || 1,
        fee: fee || 500,
        clinicAddress: clinicAddress || 'Primary Health Center',
        availability: [
          { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
          { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
          { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] }
        ]
      });
    }

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    let profile = { user: req.user };

    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      profile.doctor = doctorProfile;
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Forgot password (mock reset link)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: 'No user registered with this email address' });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link generated and simulated successfully!'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

