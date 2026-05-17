const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri === 'your_mongodb_connection_string') {
    throw new Error('MONGO_URI is not set in backend/.env. Add a valid MongoDB connection string.');
  }

  await mongoose.connect(uri);
  console.log('MongoDB Connected');
};

module.exports = connectDB;
