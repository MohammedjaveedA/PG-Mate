const mongoose = require('mongoose');

const pgHostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  contact: {
    phone: String,
    email: String
  },
  facilities: [String],
  totalRooms: Number,
  occupiedRooms: Number,
  images: [String],
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PGHostel', pgHostelSchema);