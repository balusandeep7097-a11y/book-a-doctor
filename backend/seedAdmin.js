const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/book-a-doctor');
    console.log('MongoDB connected for seeding admin...');

    const email = 'admin@example.com';
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      name: 'System Administrator',
      email,
      password: 'admin123', // Model hook will hash this, but we can do it normally. Oh, wait, the pre-save hook handles hashing! Let's check User.js.
      // Yes, UserSchema.pre('save') encrypts the password. So we just pass 'admin123' as plain text!
      role: 'admin'
    });

    console.log('Admin user seeded successfully:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
