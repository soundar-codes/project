require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '5mb' }));

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to Local MongoDB Database (Requested by User)');
  } catch (err) {
    console.error('❌ Failed to connect to local MongoDB. Falling back to in-memory MongoDB...', err.message);
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('✅ Connected to In-Memory MongoDB Database (Fallback successful)');
  }
  
  app.use('/api/auth',    require('./routes/auth'));
  app.use('/api/projects',require('./routes/projects'));
  app.use('/api/apps',    require('./routes/apps'));
  app.use('/api/builder', require('./routes/builder'));

  app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
};

connectDB();
