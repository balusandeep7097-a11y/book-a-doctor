const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book-a-doctor';
  const localUri = 'mongodb://127.0.0.1:27017/book-a-doctor';

  try {
    const conn = await mongoose.connect(primaryUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Primary MongoDB Connection Error: ${error.message}`);
    if (primaryUri !== localUri) {
      console.log('Attempting fallback to local MongoDB instance...');
      try {
        const localConn = await mongoose.connect(localUri);
        console.log(`MongoDB Connected (Local Fallback): ${localConn.connection.host}`);
        return;
      } catch (localErr) {
        console.error(`Local MongoDB Fallback Error: ${localErr.message}`);
      }
    }
    console.log('Ensure MongoDB service is running (e.g. net start MongoDB on Windows).');
    process.exit(1);
  }
};

module.exports = connectDB;
