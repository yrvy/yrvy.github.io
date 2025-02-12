const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const jwt = require('jsonwebtoken');

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all active rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('creator', 'username')
      .populate('listeners', 'username')
      .sort('-createdAt');

    // Get real-time listener counts from socket server
    const roomsWithCounts = rooms.map(room => {
      const roomUsers = req.app.get('io').sockets.adapter.rooms.get(room._id.toString());
      const activeListeners = roomUsers ? roomUsers.size : 0;
      return {
        ...room.toObject(),
        activeListeners
      };
    });

    res.json(roomsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms' });
  }
});

// Create a new room
router.post('/', auth, async (req, res) => {
  try {
    const { name, isPrivate, password } = req.body;
    
    const room = new Room({
      name,
      creator: req.user._id,
      isPrivate: isPrivate || false,
      password,
      listeners: [req.user._id]
    });

    await room.save();
    
    // Populate creator info before sending response
    await room.populate('creator', 'username');
    await room.populate('listeners', 'username');
    
    res.status(201).json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(400).json({ message: 'Error creating room' });
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('creator', 'username')
      .populate('listeners', 'username');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching room' });
  }
});

// Join room
router.post('/:id/join', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room is private and requires password
    if (room.isPrivate) {
      const { password } = req.body;
      if (!password) {
        return res.status(403).json({ message: 'Password required' });
      }
      if (password !== room.password) {
        return res.status(403).json({ message: 'Incorrect password' });
      }
    }

    if (!room.listeners.includes(req.user._id)) {
      room.listeners.push(req.user._id);
      await room.save();
    }

    await room.populate('creator', 'username');
    await room.populate('listeners', 'username');
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error joining room' });
  }
});

// Leave room
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.listeners = room.listeners.filter(id => id.toString() !== req.user._id.toString());
    await room.save();
    
    res.json({ message: 'Left room successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving room' });
  }
});

module.exports = router; 