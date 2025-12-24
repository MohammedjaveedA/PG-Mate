// routes/student.js - ADD THESE ROUTES
const express = require('express');
const router = express.Router();
const { auth, isStudent } = require('../middleware/auth');
const User = require('../models/user');

// Student selects PG
router.patch('/select-pg', auth, isStudent, async (req, res) => {
  try {
    const { pgHostelId } = req.body;
    
    if (!pgHostelId) {
      return res.status(400).json({
        success: false,
        message: 'PG/Hostel ID is required'
      });
    }
    
    // Update logged-in student's PG
    const student = await User.findByIdAndUpdate(
      req.user.id,
      { pgHostelId },
      { new: true }
    ).select('name email pgHostelId');
    
    res.json({
      success: true,
      message: 'Successfully joined PG/Hostel',
      student
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Get student's current PG info
router.get('/my-pg', auth, isStudent, async (req, res) => {
  try {
    const student = await User.findById(req.user.id)
      .populate('pgHostelId', 'name address facilities contact');
    
    res.json({
      success: true,
      student
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Student leaves PG
router.patch('/leave-pg', auth, isStudent, async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(
      req.user.id,
      { pgHostelId: null },
      { new: true }
    ).select('name email pgHostelId');
    
    res.json({
      success: true,
      message: 'Successfully left PG/Hostel',
      student
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;