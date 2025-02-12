const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    select: false
  },
  theme: {
    type: String,
    enum: ['cozyRoom', 'neonCity', 'lofiCafe', 'retroArcade', 'nightSky', 'jazzClub'],
    default: 'cozyRoom'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastActivity when users connect/disconnect
placeSchema.methods.updateActivity = function() {
  this.lastActivity = Date.now();
  return this.save();
};

const Place = mongoose.model('Place', placeSchema);

module.exports = Place; 