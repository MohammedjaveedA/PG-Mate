const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const pgRoutes = require('./routes/pghostel');
const studentRoutes = require('./routes/student');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes); // ← ADD THIS LINE
app.use('/api/pghostel', pgRoutes);
app.use('/api/student', studentRoutes);

// Test routes
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is working!',
    routes: {
      auth: '/api/auth',
      issues: '/api/issues'
    }
  });
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pg-hostel-management';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`✅ Connected to MongoDB: ${MONGO_URI}`);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      // console.log(`\n📡 Available Routes:`);
      // console.log(`   GET  http://localhost:${PORT}/api/test`);
      // console.log(`   POST http://localhost:${PORT}/api/auth/register`);
      // console.log(`   POST http://localhost:${PORT}/api/auth/login`);
      // console.log(`   POST http://localhost:${PORT}/api/issues`);
      // console.log(`   GET  http://localhost:${PORT}/api/issues/my-issues`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });