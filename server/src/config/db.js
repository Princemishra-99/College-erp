import mongoose from 'mongoose';
import dns from 'node:dns';

// Fix for Windows DNS ECONNREFUSED on MongoDB SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore if not supported
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/college_erp', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.warn(`[Database Tip] If MongoDB is not running locally, update MONGO_URI in server/.env with your free MongoDB Atlas connection string.`);
  }
};
