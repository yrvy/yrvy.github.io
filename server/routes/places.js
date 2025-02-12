const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const auth = require('../middleware/auth');

// Get my places
router.get('/my-places', auth, async (req, res) => {
  try {
    const places = await Place.find({ creator: req.user._id })
      .populate('creator', 'username displayName profilePicture')
      .populate('members', 'username displayName profilePicture')
      .sort('-createdAt');
    
    res.json(places);
  } catch (error) {
    console.error('Error fetching my places:', error);
    res.status(500).json({ message: 'Error fetching places' });
  }
});

// Create a new place
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPrivate, password, theme } = req.body;
    
    const place = new Place({
      name,
      description,
      creator: req.user._id,
      isPrivate: isPrivate || false,
      password: isPrivate ? password : undefined,
      theme: theme || 'synthwave',
      members: [req.user._id]
    });

    await place.save();
    
    // Populate creator info before sending response
    await place.populate('creator', 'username displayName profilePicture');
    await place.populate('members', 'username displayName profilePicture');
    
    res.status(201).json(place);
  } catch (error) {
    console.error('Error creating place:', error);
    res.status(400).json({ message: 'Error creating place' });
  }
});

// Get place by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)
      .populate('creator', 'username displayName profilePicture')
      .populate('members', 'username displayName profilePicture');

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Check if user is allowed to access this place
    if (place.isPrivate && !place.members.some(id => id.equals(req.user._id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(place);
  } catch (error) {
    console.error('Error fetching place:', error);
    res.status(500).json({ message: 'Error fetching place' });
  }
});

// Delete place
router.delete('/:id', auth, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Check if user is the creator
    if (!place.creator.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this place' });
    }

    await Place.deleteOne({ _id: place._id });
    res.json({ message: 'Place deleted successfully' });
  } catch (error) {
    console.error('Error deleting place:', error);
    res.status(500).json({ message: 'Error deleting place' });
  }
});

// Join place
router.post('/:id/join', auth, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Check if user is allowed to join
    if (place.isPrivate && !place.members.some(userId => userId.equals(req.user._id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add user to connected users if not already there
    if (!place.members.includes(req.user._id)) {
      place.members.push(req.user._id);
      await place.save();
    }

    await place.populate('creator', 'username displayName profilePicture');
    await place.populate('members', 'username displayName profilePicture');
    
    res.json(place);
  } catch (error) {
    console.error('Error joining place:', error);
    res.status(500).json({ message: 'Error joining place' });
  }
});

// Leave place
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Remove user from connected users
    place.members = place.members.filter(
      userId => !userId.equals(req.user._id)
    );
    
    await place.save();
    
    res.json({ message: 'Left place successfully' });
  } catch (error) {
    console.error('Error leaving place:', error);
    res.status(500).json({ message: 'Error leaving place' });
  }
});

// Add user to allowed users (invite)
router.post('/:id/invite', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const place = await Place.findById(req.params.id);
    
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Check if requester is the creator
    if (!place.creator.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the creator can invite users' });
    }

    // Add user to allowed users if not already there
    if (!place.members.includes(userId)) {
      place.members.push(userId);
      await place.save();
    }

    res.json({ message: 'User invited successfully' });
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ message: 'Error inviting user' });
  }
});

module.exports = router; 