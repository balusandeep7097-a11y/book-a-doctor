const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

dotenv.config();

const newDoctorsData = [
  {
    name: 'Dr. Prasad',
    email: 'prasad123@gmail.com',
    password: 'prasasd123',
    role: 'doctor',
    avatar: '/assets/images/doctor_avatar_1.jpg',
    doctorDetails: {
      specialty: 'Neurologist',
      experience: 12,
      fee: 800,
      bio: 'Senior Neurologist with over 12 years of clinical excellence in diagnosing and treating complex neurological disorders.',
      clinicAddress: 'Care Hospitals, Banjara Hills, Hyderabad',
      rating: 4.9,
      reviewsCount: 38,
      verificationStatus: 'approved',
      availability: [
        { day: 'Monday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
        { day: 'Wednesday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
        { day: 'Friday', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
        { day: 'Saturday', slots: ['10:00 AM', '12:00 PM'] }
      ]
    }
  },
  {
    name: 'Dr. Naveen',
    email: 'naveen123@gmail.com',
    password: 'naveen123',
    role: 'doctor',
    avatar: '/assets/images/doctor_avatar_2.jpg',
    doctorDetails: {
      specialty: 'Dermatologist',
      experience: 9,
      fee: 650,
      bio: 'Consultant Dermatologist specializing in aesthetic dermatology, skin laser treatments, and advanced clinical care.',
      clinicAddress: 'KIMS Hospitals, Gachibowli, Hyderabad',
      rating: 4.8,
      reviewsCount: 29,
      verificationStatus: 'approved',
      availability: [
        { day: 'Tuesday', slots: ['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'] },
        { day: 'Thursday', slots: ['10:00 AM', '12:00 PM', '03:00 PM', '05:00 PM'] },
        { day: 'Saturday', slots: ['10:00 AM', '01:00 PM', '04:00 PM'] }
      ]
    }
  },
  {
    name: 'Dr. Sandeep',
    email: 'sandeep123@gmail.com',
    password: 'sandeep123',
    role: 'doctor',
    avatar: '/assets/images/doctor_avatar_3.jpg',
    doctorDetails: {
      specialty: 'Cardiologist',
      experience: 14,
      fee: 1000,
      bio: 'Lead Cardiologist dedicated to non-invasive cardiology, preventive heart care, and cardiac rehabilitation.',
      clinicAddress: 'Yashoda Hospitals, Hitec City, Hyderabad',
      rating: 5.0,
      reviewsCount: 52,
      verificationStatus: 'approved',
      availability: [
        { day: 'Monday', slots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'] },
        { day: 'Wednesday', slots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'] },
        { day: 'Friday', slots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM'] }
      ]
    }
  }
];

const seedNewDoctors = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book-a-doctor';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB: ${mongoUri}`);

    for (const docData of newDoctorsData) {
      let existingUser = await User.findOne({ email: docData.email });
      let userId;

      if (existingUser) {
        console.log(`User ${docData.email} already exists. Updating doctor details...`);
        userId = existingUser._id;
        existingUser.name = docData.name;
        existingUser.avatar = docData.avatar;
        await existingUser.save();
      } else {
        const newUser = await User.create({
          name: docData.name,
          email: docData.email,
          password: docData.password,
          role: docData.role,
          avatar: docData.avatar
        });
        userId = newUser._id;
        console.log(`Created User: ${docData.name} (${docData.email})`);
      }

      let existingDoctor = await Doctor.findOne({ user: userId });
      if (existingDoctor) {
        Object.assign(existingDoctor, docData.doctorDetails);
        await existingDoctor.save();
        console.log(`Updated Doctor Profile for ${docData.name}`);
      } else {
        await Doctor.create({
          user: userId,
          ...docData.doctorDetails
        });
        console.log(`Created Doctor Profile for ${docData.name}`);
      }
    }

    console.log('Successfully added all 3 new doctors!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding new doctors:', error);
    process.exit(1);
  }
};

seedNewDoctors();
