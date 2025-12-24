const express = require('express');
const router = express.Router();
const { auth, isOwner } = require('../middleware/auth');
const PGHostel = require('../models/PGHostel');

// Create PG/Hostel (Owner only)
router.post('/', auth, isOwner, async (req, res) => {
  try {
    console.log('📝 Creating PG/Hostel for owner:', req.user);
    
    const pgHostel = new PGHostel({
      ...req.body,
      ownerId: req.user.id
    });
    
    await pgHostel.save();
    
    res.status(201).json({
      success: true,
      message: 'PG/Hostel created successfully',
      pgHostel
    });
  } catch (err) {
    console.error('❌ Error creating PG:', err);
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
});

// Get all PGs (public - for student registration)
router.get('/list', async (req, res) => {
  try {
    const pgHostels = await PGHostel.find({ isActive: true })
      .select('name address facilities');
    
    res.json({
      success: true,
      count: pgHostels.length,
      pgHostels
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});
  

// In your backend (pghostel routes)

router.get('/owner', auth, async (req, res) => {
  try {
    const pgs = await PGHostel.find({ ownerId: req.user.id });
    console.log('🔍 Searching PGs for ownerId:', req.user.id);
    console.log('📊 Found PGs:', pgs);
    res.json({ success: true, pgs });
  } catch (err) {
    console.error('❌ Error fetching PGs:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// Update PG/Hostel (Owner only)
router.put('/:id', auth, isOwner, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find PG and verify ownership
    const pgHostel = await PGHostel.findOne({ 
      _id: id, 
      ownerId: req.user.id 
    });
    
    if (!pgHostel) {
      return res.status(404).json({ 
        success: false,
        message: 'PG/Hostel not found or you are not the owner' 
      });
    }
    
    // Update PG
    const updatedPG = await PGHostel.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'PG/Hostel updated successfully',
      pgHostel: updatedPG
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
});


// routes/pghostel.js - UPDATE THE /my ENDPOINT
router.get('/my', auth, isOwner, async (req, res) => {
  try {
    console.log('🔍 Fetching PGs for owner ID:', req.user.id);
    console.log('🔍 Owner role:', req.user.role);
    
    const pgHostels = await PGHostel.find({ ownerId: req.user.id })
      .sort({ createdAt: -1 });
    
    console.log('✅ Found PGs count:', pgHostels.length);
    console.log('✅ PGs found:', pgHostels.map(pg => ({
      id: pg._id,
      name: pg.name,
      ownerId: pg.ownerId
    })));
    
    res.json({
      success: true,
      count: pgHostels.length,
      pgHostels
    });
  } catch (err) {
    console.error('❌ Error fetching owner PGs:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});



// In routes/pghostel.js - ADD THIS DELETE ENDPOINT

// Delete PG/Hostel (Owner only)
router.delete('/:id', auth, isOwner, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting PG with ID: ${id} for owner: ${req.user.id}`);
    
    // Find PG and verify ownership
    const pgHostel = await PGHostel.findOne({ 
      _id: id, 
      ownerId: req.user.id 
    });
    
    if (!pgHostel) {
      return res.status(404).json({ 
        success: false,
        message: 'PG/Hostel not found or you are not the owner' 
      });
    }
    
    // Optional: Check if there are active issues before deleting
    const Issue = require('../models/issue');
    const activeIssues = await Issue.countDocuments({ 
      pgHostelId: id,
      status: { $in: ['pending', 'in-progress'] }
    });
    
    if (activeIssues > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete PG. There are ${activeIssues} active issues. Resolve them first.`
      });
    }
    
    // Delete the PG
    await PGHostel.findByIdAndDelete(id);
    
    console.log(`✅ PG deleted successfully: ${pgHostel.name}`);
    
    res.json({
      success: true,
      message: 'PG/Hostel deleted successfully'
    });
  } catch (err) {
    console.error('❌ Error deleting PG:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});
module.exports = router;