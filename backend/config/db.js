import mongoose from 'mongoose';

let isMongoConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shipms';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });
    isMongoConnected = true;
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB connection not reached at ${mongoURI}.`);
    console.warn('⚡ Operating in Hybrid In-Memory / Local DB mode (MERN ready).');
    isMongoConnected = false;
  }
};

export const getMongoStatus = () => isMongoConnected;
