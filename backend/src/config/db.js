const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI non configurata');
  }
  await mongoose.connect(uri);
  return mongoose.connection;
}

module.exports = connectDB;
