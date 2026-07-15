const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Document = require('./models/Document');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('=== STARTING BOOK A DOCTOR SYSTEM FLOW VALIDATION ===\n');

  try {
    // 1. Connect to DB to clear previous test data
    console.log('Connecting to database to clear previous test data...');
    await mongoose.connect('mongodb://127.0.0.1:27017/book-a-doctor');
    
    // Find previous doctor and patient users to delete them and their details
    const testEmails = ['doctor@example.com', 'patient@example.com'];
    const usersToDelete = await User.find({ email: { $in: testEmails } });
    const userIds = usersToDelete.map(u => u._id);

    // Delete related doctor profile, appointments, documents
    if (userIds.length > 0) {
      await Doctor.deleteMany({ user: { $in: userIds } });
      await Appointment.deleteMany({ $or: [{ patient: { $in: userIds } }] });
      await Document.deleteMany({ patient: { $in: userIds } });
      await User.deleteMany({ email: { $in: testEmails } });
      console.log('Cleaned up previous test users and relationships.');
    } else {
      console.log('No previous test users found. Clean slate.');
    }
    
    // Disconnect mongoose so it doesn't block process exit
    await mongoose.connection.close();
    console.log('Database connection closed for setup phase. Starting API assertions.\n');

    // 2. Register Doctor
    console.log('[STEP 1] Registering a new Doctor profile...');
    const docRegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dr. Sandeep Bonthu',
        email: 'doctor@example.com',
        password: 'password123',
        role: 'doctor',
        specialty: 'Cardiologist',
        experience: 8,
        fee: 500,
        clinicAddress: 'Apollo Hospitals, Jubilee Hills, Hyderabad'
      })
    });
    const docReg = await docRegRes.json();
    if (!docReg.success) throw new Error('Doctor registration failed: ' + JSON.stringify(docReg));
    console.log('✔ Doctor registered successfully! JWT Token received.');
    const doctorToken = docReg.token;

    // Fetch doctor's profile to get doctor's ID
    const docProfileRes = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${doctorToken}` }
    });
    const docProfile = await docProfileRes.json();
    if (!docProfile.success) throw new Error('Could not fetch doctor profile: ' + JSON.stringify(docProfile));
    const doctorId = docProfile.data.doctor._id;
    console.log(`✔ Fetched Doctor ID: ${doctorId}. Verification status: ${docProfile.data.doctor.verificationStatus}`);

    // 3. Admin Login & Verification
    console.log('\n[STEP 2] Logging in as Admin...');
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    const adminLogin = await adminLoginRes.json();
    if (!adminLogin.success) throw new Error('Admin login failed: ' + JSON.stringify(adminLogin));
    console.log('✔ Admin logged in successfully!');
    const adminToken = adminLogin.token;

    console.log(`Approving doctor with ID: ${doctorId}...`);
    const approveRes = await fetch(`${API_URL}/doctors/${doctorId}/verify`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    const approveData = await approveRes.json();
    if (!approveData.success) throw new Error('Doctor approval failed: ' + JSON.stringify(approveData));
    console.log(`✔ Doctor approved successfully! Verification status: ${approveData.data.verificationStatus}`);

    // 4. Register Patient
    console.log('\n[STEP 3] Registering a new Patient...');
    const patRegRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'patient@example.com',
        password: 'password123',
        role: 'patient'
      })
    });
    const patReg = await patRegRes.json();
    if (!patReg.success) throw new Error('Patient registration failed: ' + JSON.stringify(patReg));
    console.log('✔ Patient registered successfully!');
    const patientToken = patReg.token;

    // 5. Book Appointment
    console.log('\n[STEP 4] Booking appointment with approved doctor for tomorrow...');
    const todayDate = new Date();
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

    const bookRes = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${patientToken}`
      },
      body: JSON.stringify({
        doctorId: doctorId,
        date: tomorrowStr,
        timeSlot: '10:00 AM'
      })
    });
    const booking = await bookRes.json();
    if (!booking.success) throw new Error('Booking appointment failed: ' + JSON.stringify(booking));
    const appointmentId = booking.data._id;
    console.log(`✔ Appointment booked successfully for tomorrow (${tomorrowStr})! ID: ${appointmentId}, Status: ${booking.data.status}`);

    // 5b. Verify Auto-Reminders for Tomorrow's Appointments
    console.log('\n[STEP 4b] Verifying notification reminders for tomorrow (while status is pending)...');
    const getNotifRes = await fetch(`${API_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${patientToken}`
      }
    });
    const notifs = await getNotifRes.json();
    if (!notifs.success) throw new Error('Fetching notifications failed: ' + JSON.stringify(notifs));
    
    const reminder = notifs.data.find(n => n.type === 'appointment');
    if (!reminder) {
      throw new Error('Reminder notification for tomorrow\'s appointment was not generated!');
    }
    console.log(`✔ Tomorrow reminder notification found: "${reminder.message}"`);
    console.log(`✔ Notification status is unread: isRead = ${reminder.isRead}`);

    console.log(`Marking notification ${reminder._id} as read...`);
    const readRes = await fetch(`${API_URL}/notifications/${reminder._id}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${patientToken}`
      }
    });
    const readNotif = await readRes.json();
    if (!readNotif.success) throw new Error('Marking notification as read failed: ' + JSON.stringify(readNotif));
    console.log(`✔ Notification successfully updated: isRead = ${readNotif.data.isRead}`);

    // 5c. Verify Manual Email Details Trigger
    console.log('\n[STEP 4c] Triggering manual email notification regarding appointment details...');
    const emailRes = await fetch(`${API_URL}/appointments/${appointmentId}/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${patientToken}`
      }
    });
    const emailData = await emailRes.json();
    if (!emailData.success) throw new Error('Triggering appointment email failed: ' + JSON.stringify(emailData));
    console.log(`✔ Appointment email API response: "${emailData.message}"`);

    // 6. Upload Medical Document
    console.log('\n[STEP 5] Uploading dummy report.png for Doctor review...');
    const reportPath = path.join(__dirname, '..', 'report.png');
    if (!fs.existsSync(reportPath)) {
      throw new Error('Test file report.png does not exist! Run createDummyFiles.js first.');
    }
    
    // Create FormData with file and doctorId
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(reportPath);
    const fileBlob = new Blob([fileBuffer], { type: 'image/png' });
    formData.append('file', fileBlob, 'report.png');
    formData.append('doctorId', doctorId);

    const uploadRes = await fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${patientToken}`
      },
      body: formData
    });
    const uploadData = await uploadRes.json();
    if (!uploadData.success) throw new Error('Uploading document failed: ' + JSON.stringify(uploadData));
    console.log(`✔ Medical report uploaded successfully! URL: ${uploadData.data.fileUrl}`);

    // 7. Doctor Consult & Prescribe
    console.log('\n[STEP 6] Doctor consulting patient and submitting digital prescription...');
    const prescribeRes = await fetch(`${API_URL}/appointments/${appointmentId}/prescription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${doctorToken}`
      },
      body: JSON.stringify({
        symptoms: 'Mild chest tightness',
        medicines: 'Aspirin 75mg once daily, Atorvastatin 10mg once daily',
        notes: 'Strict dietary control. Schedule review consultation in 2 weeks.'
      })
    });
    const prescription = await prescribeRes.json();
    if (!prescription.success) throw new Error('Submitting prescription failed: ' + JSON.stringify(prescription));
    console.log(`✔ Prescription added successfully! Appointment status is now: ${prescription.data.status}`);

    // 8. Patient Verify Completed Session
    console.log('\n[STEP 7] Patient fetching completed appointments to verify details...');
    const fetchAppointmentsRes = await fetch(`${API_URL}/appointments`, {
      headers: {
        'Authorization': `Bearer ${patientToken}`
      }
    });
    const appts = await fetchAppointmentsRes.json();
    if (!appts.success) throw new Error('Fetching appointments failed: ' + JSON.stringify(appts));
    const targetAppt = appts.data.find(a => a._id === appointmentId);
    if (!targetAppt) throw new Error('Could not find completed appointment in user list!');
    console.log(`✔ Appointment found in patient list! Status: ${targetAppt.status}`);
    console.log('✔ Prescription Details:');
    console.log(`   - Symptoms: "${targetAppt.prescription.symptoms}"`);
    console.log(`   - Medicines: "${targetAppt.prescription.medicines}"`);
    console.log(`   - Notes: "${targetAppt.prescription.notes}"`);



    console.log('\n======================================================');
    console.log('🎉 SYSTEM FLOW VALIDATION SUCCESSFUL: ALL TESTS PASSED! 🎉');
    console.log('======================================================');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ VALIDATION TEST FAILED:');
    console.error(error.message);
    process.exit(1);
  }
};

runTests();
