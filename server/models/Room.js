const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentTrack: {
    videoId: String,
    title: String,
    thumbnail: String,
    startedAt: Date
  },
  queue: [{
    videoId: String,
    title: String,
    thumbnail: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  listeners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema); 