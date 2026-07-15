const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot } = req.body;

    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, error: 'Only patients can book appointments' });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    // Check if slot is already booked for this doctor on this date
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, error: 'This time slot is already booked' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      timeSlot,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'patient') {
      // Find patient's appointments
      appointments = await Appointment.find({ patient: req.user._id })
        .populate({
          path: 'doctor',
          populate: {
            path: 'user',
            select: 'name email avatar'
          }
        })
        .sort('-createdAt');
    } else if (req.user.role === 'doctor') {
      // Find doctor's appointments
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) {
        return res.status(404).json({ success: false, error: 'Doctor profile not found' });
      }
      appointments = await Appointment.find({ doctor: doctor._id })
        .populate('patient', 'name email avatar')
        .sort('-createdAt');
    } else if (req.user.role === 'admin') {
      // Return all appointments for admin dashboard
      appointments = await Appointment.find()
        .populate({
          path: 'doctor',
          populate: {
            path: 'user',
            select: 'name email'
          }
        })
        .populate('patient', 'name email')
        .sort('-createdAt');
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update appointment status (confirm, cancel, complete)
// @route   PUT /api/appointments/:id/status
// @access  Private
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid appointment status' });
    }

    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Role-based verification
    if (req.user.role === 'patient') {
      // Patients can only cancel their own appointments
      if (appointment.patient.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, error: 'Unauthorized to modify this appointment' });
      }
      if (status !== 'cancelled') {
        return res.status(400).json({ success: false, error: 'Patients can only cancel appointments' });
      }
    } else if (req.user.role === 'doctor') {
      // Doctors can confirm, complete or cancel appointments assigned to them
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, error: 'Unauthorized to modify this appointment' });
      }
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add prescription to appointment (Consultation)
// @route   POST /api/appointments/:id/prescription
// @access  Private (Doctor only)
exports.addPrescription = async (req, res) => {
  try {
    const { symptoms, medicines, notes } = req.body;

    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Verify doctor ownership
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized to prescribe for this appointment' });
    }

    appointment.prescription = {
      symptoms,
      medicines,
      notes,
      dateAdded: new Date()
    };
    appointment.status = 'completed'; // Writing prescription auto-completes the session

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Send details of appointment via email
// @route   POST /api/appointments/:id/send-email
// @access  Private
exports.sendAppointmentEmail = async (req, res) => {
  try {
    const sendEmail = require('../utils/sendEmail');
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email fee clinicAddress specialty' }
      })
      .populate('patient', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Verify ownership: either doctor or patient can trigger email
    const userId = req.user._id.toString();
    const isPatient = appointment.patient._id.toString() === userId;
    const isDoctor = appointment.doctor.user._id.toString() === userId;

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to email this appointment' });
    }

    // Determine target recipient (the requester)
    const recipientEmail = isDoctor ? appointment.doctor.user.email : appointment.patient.email;
    const recipientName = isDoctor ? appointment.doctor.user.name : appointment.patient.name;
    const docName = appointment.doctor.user.name;
    const specialty = appointment.doctor.specialty;
    const date = appointment.date;
    const timeSlot = appointment.timeSlot;
    const status = appointment.status.toUpperCase();
    const fee = appointment.doctor.fee;
    const address = appointment.doctor.clinicAddress;

    const emailSubject = `BookADoctor - Appointment Details (Status: ${status})`;
    
    let emailMessage = `Hello ${recipientName},\n\n`;
    emailMessage += `Here are the details regarding your appointment:\n\n`;
    emailMessage += `-------------------------------------------\n`;
    emailMessage += `Doctor: Dr. ${docName} (${specialty})\n`;
    emailMessage += `Date: ${date}\n`;
    emailMessage += `Time Slot: ${timeSlot}\n`;
    emailMessage += `Clinic Address: ${address}\n`;
    emailMessage += `Consultation Fee: ₹${fee}\n`;
    emailMessage += `Current Status: ${status}\n`;
    emailMessage += `-------------------------------------------\n\n`;
    
    if (appointment.prescription && appointment.prescription.symptoms) {
      emailMessage += `Digital Prescription:\n`;
      emailMessage += `- Symptoms: ${appointment.prescription.symptoms}\n`;
      emailMessage += `- Medicines: ${appointment.prescription.medicines}\n`;
      if (appointment.prescription.notes) {
        emailMessage += `- Doctor Notes: ${appointment.prescription.notes}\n`;
      }
      emailMessage += `-------------------------------------------\n\n`;
    }

    emailMessage += `Best regards,\n`;
    emailMessage += `The BookADoctor Support Team\n`;
    emailMessage += `Emergency Helpline: 1800-123-4567\n`;

    await sendEmail({
      email: recipientEmail,
      subject: emailSubject,
      message: emailMessage
    });

    res.status(200).json({
      success: true,
      message: `Appointment details successfully emailed to ${recipientEmail}!`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
