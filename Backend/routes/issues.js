const express = require('express');
const router = express.Router();
const { auth, isOwner, isStudent } = require('../middleware/auth');
const Issue = require('../models/issue');

// Student: Create new issue
router.post('/', auth, isStudent, async (req, res) => {
  try {
    // Get student from database
    const User = require('../models/user');
    const student = await User.findById(req.user.id);
    
    // Create issue with student's pgHostelId
    const issue = new Issue({
      title: req.body.title,
      description: req.body.description,
      roomNumber: req.body.roomNumber, 
      category: req.body.category,
      priority: req.body.priority || 'medium',
      studentId: req.user.id,
      pgHostelId: student.pgHostelId, // This comes from student's profile
      status: 'pending'
    });
    
    await issue.save();
    
    res.status(201).json({
      success: true,
      issue
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Student: Get my issues
router.get('/my-issues', auth, isStudent, async (req, res) => {
  try {
    const issues = await Issue.find({ studentId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('pgHostelId', 'name');
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Owner: Get all issues for my PG/Hostel
// routes/issues.js - ADD THIS ENDPOINT IF NOT EXISTS
// Get issues for a specific PG (with authentication)
router.get('/pg/:pgId', auth, async (req, res) => {
  try {
    const { pgId } = req.params;
    const { status } = req.query;
    
    console.log('🔍 Fetching issues for PG:', pgId, 'by owner:', req.user.id);
    
    // Check if user is owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Owner role required.'
      });
    }
    
    // Verify that the owner owns this PG
    const PGHostel = require('../models/PGHostel');
    const pgHostel = await PGHostel.findOne({
      _id: pgId,
      ownerId: req.user.id
    });
    
    console.log('✅ PG ownership check:', pgHostel ? 'Owner verified' : 'Not owner');
    
    if (!pgHostel) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this PG.'
      });
    }
    
    let filter = { pgHostelId: pgId };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    console.log('🔍 Filter for issues:', filter);
    
    const issues = await Issue.find(filter)
      .populate('studentId', 'name email phone')
      .populate('pgHostelId', 'name address')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${issues.length} issues for PG: ${pgHostel.name}`);
    
    res.json({
      success: true,
      pgHostel: {
        id: pgHostel._id,
        name: pgHostel.name
      },
      issues
    });
  } catch (err) {
    console.error('❌ Error fetching PG issues:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Update issue status (Owner)
// Update issue status (Owner)
router.patch('/:id/status', auth, isOwner, async (req, res) => {
  try {
    // Find owner's PG first
    const PGHostel = require('../models/PGHostel');
    const pgHostel = await PGHostel.findOne({ ownerId: req.user.id });
    
    if (!pgHostel) {
      return res.status(400).json({ 
        success: false,
        message: "You don't manage any PG" 
      });
    }
    
    const issue = await Issue.findOneAndUpdate(
      { _id: req.params.id, pgHostelId: pgHostel._id },
      { status: req.body.status, updatedAt: Date.now() },
      { new: true }
    );
    
    res.json({
      success: true,
      issue
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});



// routes/issues.js - UPDATE STATUS ENDPOINT (FIXED)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('🔄 Updating issue status:', id, 'to:', status, 'by user:', req.user.id);
    
    // Check if user is owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Owner role required.'
      });
    }
    
    // Find the issue
    const issue = await Issue.findById(id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }
    
    console.log('🔍 Found issue:', issue._id, 'for PG:', issue.pgHostelId);
    
    // Verify that the owner owns the PG associated with this issue
    const PGHostel = require('../models/PGHostel');
    const pgHostel = await PGHostel.findOne({
      _id: issue.pgHostelId,
      ownerId: req.user.id
    });
    
    if (!pgHostel) {
      console.log('❌ Owner verification failed. PG not found or not owned by user.');
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own the PG associated with this issue.'
      });
    }
    
    console.log('✅ Owner verified for PG:', pgHostel.name);
    
    // Update the issue status
    issue.status = status;
    issue.updatedAt = Date.now();
    
    if (status === 'resolved' || status === 'closed') {
      issue.resolvedAt = Date.now();
    }
    
    await issue.save();
    
    // Populate the response
    await issue.populate('studentId', 'name email phone');
    await issue.populate('pgHostelId', 'name');
    
    console.log('✅ Issue status updated successfully');
    
    res.json({
      success: true,
      message: `Issue status updated to ${status}`,
      issue
    });
  } catch (err) {
    console.error('❌ Error updating issue status:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});



// routes/issues.js - ADD COMMENT ENDPOINT (FIXED)
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, isOwner } = req.body;
    
    console.log('💬 Adding comment to issue:', id, 'by user:', req.user.id);
    
    // Check if user is owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Owner role required.'
      });
    }
    
    // Find the issue
    const issue = await Issue.findById(id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }
    
    // Verify that the owner owns the PG associated with this issue
    const PGHostel = require('../models/PGHostel');
    const pgHostel = await PGHostel.findOne({
      _id: issue.pgHostelId,
      ownerId: req.user.id
    });
    
    if (!pgHostel) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own the PG associated with this issue.'
      });
    }
    
    // Add the comment
    const comment = {
      userId: req.user.id,
      text: text,
      isOwner: true, // Always true for owner comments
      createdAt: Date.now()
    };
    
    issue.comments.push(comment);
    issue.updatedAt = Date.now();
    
    await issue.save();
    
    // Populate the response
    await issue.populate('studentId', 'name email phone');
    await issue.populate('pgHostelId', 'name');
    await issue.populate('comments.userId', 'name role');
    
    console.log('✅ Comment added successfully');
    
    res.json({
      success: true,
      message: 'Comment added successfully',
      issue
    });
  } catch (err) {
    console.error('❌ Error adding comment:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
module.exports = router;