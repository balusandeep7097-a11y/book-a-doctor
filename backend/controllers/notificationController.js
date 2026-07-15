const Notification = require('../models/Notification');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// @desc    Get user notifications (and auto-generate tomorrow appointment reminders)
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Calculate tomorrow's date string (YYYY-MM-DD)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // 2. Auto-generate patient reminders for tomorrow
    if (req.user.role === 'patient') {
      const appointmentsTomorrow = await Appointment.find({
        patient: userId,
        date: tomorrowStr,
        status: { $in: ['pending', 'confirmed'] }
      }).populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      });

      for (const appt of appointmentsTomorrow) {
        const existingNotif = await Notification.findOne({
          user: userId,
          appointmentId: appt._id,
          type: 'appointment'
        });

        if (!existingNotif) {
          const docName = appt.doctor && appt.doctor.user ? appt.doctor.user.name : 'Specialist';
          await Notification.create({
            user: userId,
            message: `Reminder: You have an appointment tomorrow (${appt.date}) at ${appt.timeSlot} with Dr. ${docName}.`,
            type: 'appointment',
            appointmentId: appt._id
          });
        }
      }
    }

    // 3. Auto-generate doctor reminders for tomorrow
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: userId });
      if (doctor) {
        const appointmentsTomorrow = await Appointment.find({
          doctor: doctor._id,
          date: tomorrowStr,
          status: { $in: ['pending', 'confirmed'] }
        }).populate('patient', 'name');

        for (const appt of appointmentsTomorrow) {
          const existingNotif = await Notification.findOne({
            user: userId,
            appointmentId: appt._id,
            type: 'appointment'
          });

          if (!existingNotif) {
            const patName = appt.patient ? appt.patient.name : 'Patient';
            await Notification.create({
              user: userId,
              message: `Reminder: You have a scheduled consultation tomorrow (${appt.date}) at ${appt.timeSlot} with patient ${patName}.`,
              type: 'appointment',
              appointmentId: appt._id
            });
          }
        }
      }
    }

    // 4. Fetch all notifications for the user
    const notifications = await Notification.find({ user: userId })
      .sort('-createdAt')
      .limit(30);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    // Check ownership
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized action' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Clear all user notifications
// @route   DELETE /api/notifications
// @access  Private
exports.clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.status(200).json({
      success: true,
      message: 'All notifications cleared successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
