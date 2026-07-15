const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

const doctorsData = [
  {
    name: 'Dr. Jane Smith',
    email: 'janesmith@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Dermatologist',
    experience: 12,
    fee: 600,
    bio: 'Certified dermatologist specializing in clinical skincare and cosmetic treatments.',
    clinicAddress: 'Skin Care Clinic, Mumbai'
  },
  {
    name: 'Dr. Alice Johnson',
    email: 'alicejohnson@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Pediatrician',
    experience: 15,
    fee: 450,
    bio: 'Dedicated pediatrician with over 15 years of experience in newborn care and childhood illnesses.',
    clinicAddress: 'Lotus Children Hospital, Bangalore'
  },
  {
    name: 'Dr. Rajesh Kumar',
    email: 'rajeshkumar@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'General Practitioner',
    experience: 20,
    fee: 350,
    bio: 'Experienced general practitioner focusing on family medicine, preventative care, and wellness checks.',
    clinicAddress: 'Global Health Clinic, Delhi'
  },
  {
    name: 'Dr. David Miller',
    email: 'davidmiller@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Neurologist',
    experience: 10,
    fee: 800,
    bio: 'Specialist in clinical neurology, managing chronic headaches, stroke rehabilitation, and sleep disorders.',
    clinicAddress: 'Neurology Center, Chennai'
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'priyasharma@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Dentist',
    experience: 7,
    fee: 400,
    bio: 'Professional dental surgeon specializing in cosmetic dentistry, root canal treatments, and teeth alignment.',
    clinicAddress: 'Smile Dental Clinic, Pune'
  }
];

const seedDoctors = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/book-a-doctor');
    console.log('MongoDB connected for seeding mock doctors...');

    for (const doc of doctorsData) {
      // Check if user exists
      const existingUser = await User.findOne({ email: doc.email });
      if (existingUser) {
        console.log(`User ${doc.email} already exists, skipping.`);
        continue;
      }

      // Create User
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: doc.password,
        role: doc.role
      });

      // Create corresponding Doctor profile
      await Doctor.create({
        user: user._id,
        specialty: doc.specialty,
        experience: doc.experience,
        fee: doc.fee,
        bio: doc.bio,
        clinicAddress: doc.clinicAddress,
        verificationStatus: 'approved',
        availability: [
          { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
          { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
          { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] }
        ]
      });

      console.log(`Seeded doctor profile for ${doc.name} (${doc.specialty})`);
    }

    console.log('\nDoctors seeding complete successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
};

seedDoctors();
