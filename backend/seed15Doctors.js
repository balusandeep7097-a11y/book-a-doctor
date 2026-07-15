const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

const newDoctorsData = [
  {
    name: 'Dr. Amit Patel',
    email: 'amitpatel@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Anesthesiology',
    experience: 11,
    fee: 700,
    bio: 'Specialist in clinical anesthesia and pain management for surgical procedures.',
    clinicAddress: 'City Anesthesia Group, Delhi'
  },
  {
    name: 'Dr. Sunita Rao',
    email: 'sunitarao@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Bariatrics',
    experience: 14,
    fee: 900,
    bio: 'Expert bariatric surgeon helping patients manage obesity and metabolic disorders.',
    clinicAddress: 'Obesity Cure Center, Mumbai'
  },
  {
    name: 'Dr. Robert Vance',
    email: 'robertvance@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Cardiac Sciences',
    experience: 18,
    fee: 1000,
    bio: 'Cardiothoracic specialist offering advanced care for coronary and structural heart conditions.',
    clinicAddress: 'Vance Heart Institute, Chennai'
  },
  {
    name: 'Dr. Monica Geller',
    email: 'monicageller@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Cosmetology & Plastic Surgery',
    experience: 9,
    fee: 850,
    bio: 'Certified plastic surgeon focusing on aesthetic reconstruction, cosmetic improvements, and skincare.',
    clinicAddress: 'Aesthetic Clinic, Pune'
  },
  {
    name: 'Dr. Charles Bing',
    email: 'charlesbing@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Critical Care',
    experience: 13,
    fee: 500,
    bio: 'Intensivist doctor specializing in complex life-support systems and organ recovery management.',
    clinicAddress: 'Care ICU Hospital, Hyderabad'
  },
  {
    name: 'Dr. Rachel Green',
    email: 'rachelgreen@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Critical Care & Emergency Medicine',
    experience: 10,
    fee: 650,
    bio: 'Emergency medicine practitioner dedicated to immediate diagnosis and critical triage procedures.',
    clinicAddress: 'Metro Emergency Hospital, Bangalore'
  },
  {
    name: 'Dr. Joey Tribbiani',
    email: 'joeytribbiani@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Dentist',
    experience: 6,
    fee: 300,
    bio: 'Friendly family dentist providing cleanings, cavity fillings, and routine oral health checkups.',
    clinicAddress: 'Oral Care Clinic, Kolkata'
  },
  {
    name: 'Dr. Ross Geller',
    email: 'rossgeller@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Dermatologist',
    experience: 16,
    fee: 550,
    bio: 'Clinical dermatologist diagnosing skin allergies, acne, eczema, and skin cancer screenings.',
    clinicAddress: 'Dermal Care Group, Hyderabad'
  },
  {
    name: 'Dr. Phoebe Buffay',
    email: 'phoebebuffay@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Dietician and Nutrition',
    experience: 8,
    fee: 400,
    bio: 'Holistic nutritionist offering personalized diet charting, weight loss strategies, and nutritional plans.',
    clinicAddress: 'Healthy Life Wellness Center, Mumbai'
  },
  {
    name: 'Dr. Leonard Hofstadter',
    email: 'leonardhofstadter@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Neurologist',
    experience: 15,
    fee: 850,
    bio: 'Expert clinical neurologist diagnosing epilepsy, peripheral neuropathies, and migraine management.',
    clinicAddress: 'Brain Diagnostics Clinic, Bangalore'
  },
  {
    name: 'Dr. Sheldon Cooper',
    email: 'sheldoncooper@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Psychiatrist',
    experience: 17,
    fee: 1200,
    bio: 'Behavioral specialist helping patients manage anxiety, depression, and advanced cognitive therapies.',
    clinicAddress: 'Mind Wellness Institute, Delhi'
  },
  {
    name: 'Dr. Howard Wolowitz',
    email: 'howardwolowitz@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Orthopedic',
    experience: 11,
    fee: 500,
    bio: 'Orthopedic surgeon focusing on joint replacements, fracture repairs, and physical rehabilitation guides.',
    clinicAddress: 'Bone & Joint Care Clinic, Chennai'
  },
  {
    name: 'Dr. Bernadette Rostenkowski',
    email: 'bernadetter@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Pediatrician',
    experience: 12,
    fee: 450,
    bio: 'Compassionate pediatrician focusing on developmental milestones, vaccinations, and youth wellness.',
    clinicAddress: 'Little Angels Hospital, Mumbai'
  },
  {
    name: 'Dr. Amy Farrah Fowler',
    email: 'amyfarrah@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'Neurologist',
    experience: 14,
    fee: 750,
    bio: 'Neurobiologist and clinician analyzing nervous system patterns and chronic neuromotor treatments.',
    clinicAddress: 'Neuroscience Research Center, Pune'
  },
  {
    name: 'Dr. Gregory House',
    email: 'gregoryhouse@example.com',
    password: 'password123',
    role: 'doctor',
    specialty: 'General Practitioner',
    experience: 25,
    fee: 1100,
    bio: 'Diagnostic general practitioner specializing in rare diseases, pathology analysis, and complex medical cases.',
    clinicAddress: 'Princeton-Plainsboro Clinic, Hyderabad'
  }
];

const seedMoreDoctors = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/book-a-doctor');
    console.log('MongoDB connected for seeding 15 additional doctors...');

    for (const doc of newDoctorsData) {
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
          { day: 'Tuesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
          { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
          { day: 'Saturday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] }
        ]
      });

      console.log(`Seeded doctor profile for ${doc.name} (${doc.specialty})`);
    }

    console.log('\nSeeding of 15 additional doctors complete successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding additional doctors:', error);
    process.exit(1);
  }
};

seedMoreDoctors();
