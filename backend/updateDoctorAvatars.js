const mongoose = require('mongoose');
const User = require('./models/User');

const updateAvatars = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/book-a-doctor');
    console.log('MongoDB connected for updating doctor avatars...');

    const doctors = await User.find({ role: 'doctor' });
    console.log(`Found ${doctors.length} doctors in database.`);

    for (let i = 0; i < doctors.length; i++) {
      const doc = doctors[i];
      let avatarUrl = '';

      // Determine gender based on typical name prefixes/suffixes to assign correct avatars
      const name = doc.name.toLowerCase();
      const isFemale = name.includes('jane') || 
                       name.includes('alice') || 
                       name.includes('priya') || 
                       name.includes('sunita') || 
                       name.includes('monica') || 
                       name.includes('rachel') || 
                       name.includes('phoebe') || 
                       name.includes('bernadette') || 
                       name.includes('amy');

      if (isFemale) {
        // Alternate between female avatars 2 and 4
        avatarUrl = i % 2 === 0 ? '/assets/images/doctor_avatar_2.jpg' : '/assets/images/doctor_avatar_4.jpg';
      } else {
        // Alternate between male avatars 1 and 3
        avatarUrl = i % 2 === 0 ? '/assets/images/doctor_avatar_1.jpg' : '/assets/images/doctor_avatar_3.jpg';
      }

      doc.avatar = avatarUrl;
      await doc.save();
      console.log(`Updated avatar for ${doc.name} to ${avatarUrl}`);
    }

    console.log('\nDoctor avatars updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating doctor avatars:', error);
    process.exit(1);
  }
};

updateAvatars();
