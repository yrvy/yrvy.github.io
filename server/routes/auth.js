const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  console.log('Register request received:', req.body);
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    // Check if user exists
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already in use' : 'Username already taken' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    console.log('Saving new user...');
    try {
      await user.save();
      console.log('User saved successfully:', user._id);
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return res.status(500).json({ message: 'Error creating user account' });
    }

    // Create token
    let token;
    try {
      token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    } catch (tokenError) {
      console.error('Error creating token:', tokenError);
      return res.status(500).json({ message: 'Error creating authentication token' });
    }

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('Login request received');
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    let isMatch;
    try {
      isMatch = await user.comparePassword(password);
    } catch (passwordError) {
      console.error('Password comparison error:', passwordError);
      return res.status(500).json({ message: 'Error verifying password' });
    }

    if (!isMatch) {
      console.log('Invalid password');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful');

    // Create token
    let token;
    try {
      token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    } catch (tokenError) {
      console.error('Error creating token:', tokenError);
      return res.status(500).json({ message: 'Error creating authentication token' });
    }

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Update user settings
router.put('/settings', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { displayName, bio, profilePicture } = req.body;

    user.displayName = displayName;
    user.bio = bio;
    user.profilePicture = profilePicture;

    await user.save();

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/users/:username', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('favoriteRooms')
      .populate({
        path: 'favoriteRooms',
        populate: {
          path: 'creator',
          select: 'username'
        }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      ...user.toObject(),
      recentlyPlayed: [], // You can implement this feature later
      currentRoom: user.currentRoom
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Update user online status
router.post('/users/:userId/status', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to update this user\'s status' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isOnline = req.body.isOnline;
    await user.save();

    // Update socket.io's onlineUsers set
    const io = req.app.get('io');
    if (req.body.isOnline) {
      io.onlineUsers.add(req.params.userId);
    } else {
      io.onlineUsers.delete(req.params.userId);
    }

    res.json({ isOnline: user.isOnline });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status' });
  }
});

// Send friend request
router.post('/friends/request/:userId', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sender = await User.findById(decoded.userId);
    const receiver = await User.findById(req.params.userId);

    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if request already exists
    if (receiver.friendRequests?.includes(sender._id)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if already friends
    if (receiver.friends?.includes(sender._id)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Add to friend requests
    if (!receiver.friendRequests) receiver.friendRequests = [];
    receiver.friendRequests.push(sender._id);
    await receiver.save();

    // Notify the receiver if they're online
    const io = req.app.get('io');
    if (io.onlineUsers.has(receiver._id.toString())) {
      const receiverSocket = io.sockets.sockets.get(userSocketMap.get(receiver._id.toString()));
      if (receiverSocket) {
        receiverSocket.emit('friend_request', {
          id: sender._id,
          username: sender.username,
          displayName: sender.displayName,
          profilePicture: sender.profilePicture
        });
      }
    }

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept friend request
router.post('/friends/accept/:userId', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const receiver = await User.findById(decoded.userId);
    const sender = await User.findById(req.params.userId);

    if (!sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if request exists
    if (!receiver.friendRequests?.includes(sender._id)) {
      return res.status(400).json({ message: 'No friend request found' });
    }

    // Remove from friend requests
    receiver.friendRequests = receiver.friendRequests.filter(
      id => id.toString() !== sender._id.toString()
    );

    // Add to friends for both users
    if (!receiver.friends) receiver.friends = [];
    if (!sender.friends) sender.friends = [];
    
    receiver.friends.push(sender._id);
    sender.friends.push(receiver._id);

    await Promise.all([receiver.save(), sender.save()]);

    // Notify both users if they're online
    const io = req.app.get('io');
    const notifyData = {
      accepted: true,
      user: {
        id: receiver._id,
        username: receiver.username,
        displayName: receiver.displayName,
        profilePicture: receiver.profilePicture
      }
    };

    if (io.onlineUsers.has(sender._id.toString())) {
      const senderSocket = io.sockets.sockets.get(userSocketMap.get(sender._id.toString()));
      if (senderSocket) {
        senderSocket.emit('friend_request_response', notifyData);
      }
    }

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject friend request
router.post('/friends/reject/:userId', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const receiver = await User.findById(decoded.userId);
    const sender = await User.findById(req.params.userId);

    if (!sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from friend requests
    if (receiver.friendRequests) {
      receiver.friendRequests = receiver.friendRequests.filter(
        id => id.toString() !== sender._id.toString()
      );
      await receiver.save();
    }

    // Notify sender if they're online
    const io = req.app.get('io');
    if (io.onlineUsers.has(sender._id.toString())) {
      const senderSocket = io.sockets.sockets.get(userSocketMap.get(sender._id.toString()));
      if (senderSocket) {
        senderSocket.emit('friend_request_response', {
          accepted: false,
          user: {
            id: receiver._id,
            username: receiver.username
          }
        });
      }
    }

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove friend
router.post('/friends/remove/:userId', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    const friend = await User.findById(req.params.userId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from both users' friends lists
    user.friends = user.friends.filter(id => id.toString() !== friend._id.toString());
    friend.friends = friend.friends.filter(id => id.toString() !== user._id.toString());

    await Promise.all([user.save(), friend.save()]);

    // Notify the other user if they're online
    const io = req.app.get('io');
    if (io.onlineUsers.has(friend._id.toString())) {
      const friendSocket = io.sockets.sockets.get(userSocketMap.get(friend._id.toString()));
      if (friendSocket) {
        friendSocket.emit('friend_removed', {
          id: user._id,
          username: user.username
        });
      }
    }

    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get friend requests
router.get('/friends/requests', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .populate('friendRequests', 'username displayName profilePicture');

    res.json(user.friendRequests || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get friends list
router.get('/friends', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .populate('friends', 'username displayName profilePicture isOnline');

    res.json(user.friends || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify token endpoint
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router; 