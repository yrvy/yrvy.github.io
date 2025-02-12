const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const roomsRouter = require('./routes/rooms');
const authRouter = require('./routes/auth');
const placesRouter = require('./routes/places');
const Room = require('./models/Room');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3002',
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.set('io', io);

// In-memory room states
const roomStates = new Map();
const userSocketMap = new Map(); // Maps userId to socketId
const socketUserMap = new Map(); // Maps socketId to userId
const roomUsers = new Map(); // Maps roomId to Set of users
const onlineUsers = new Set(); // Track online users
const MAX_MESSAGES = 25;

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// MongoDB Connection with better error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB successfully');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if cannot connect to database
});

// API Routes
app.use('/api/rooms', roomsRouter);
app.use('/api/auth', authRouter);
app.use('/api/places', placesRouter);

// Socket middleware to authenticate connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const userId = socket.handshake.auth.userId;
  
  if (!token || !userId) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId !== userId) {
      return next(new Error('Invalid user ID'));
    }
    socket.userId = userId;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Socket.IO Events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Add user to online users
  if (socket.userId) {
    onlineUsers.add(socket.userId);
  }

  socket.on('join_room', ({ roomId, user }) => {
    if (!user || !user.id) return;

    // Add user to online users
    onlineUsers.add(user.id);

    // Remove old socket mapping if exists
    const oldSocketId = userSocketMap.get(user.id);
    if (oldSocketId) {
      socketUserMap.delete(oldSocketId);
      io.to(roomId).emit('user_left', oldSocketId);
      
      // Remove from old room if exists
      for (const [oldRoomId, users] of roomUsers.entries()) {
        if (users.has(oldSocketId)) {
          users.delete(oldSocketId);
          const currentUsers = Array.from(users.values());
          io.to(oldRoomId).emit('users_update', currentUsers);
        }
      }
    }

    // Set new socket mapping
    userSocketMap.set(user.id, socket.id);
    socketUserMap.set(socket.id, user.id);

    // Add user to room with complete profile data
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Map());
    }
    roomUsers.get(roomId).set(socket.id, {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      profilePicture: user.profilePicture,
      bio: user.bio,
      isHost: user.isHost
    });

    socket.join(roomId);
    
    // Send current room state to the joining user
    const roomState = roomStates.get(roomId) || { 
      currentTrack: null,
      queue: [],
      lastUpdateTime: Date.now(),
      isPlaying: true,
      currentTime: 0,
      messages: []
    };
    socket.emit('room_state', roomState);
    
    // Send current users list to all clients in the room
    const currentUsers = Array.from(roomUsers.get(roomId).values());
    io.to(roomId).emit('users_update', currentUsers);
  });

  const cleanupEmptyRoom = async (roomId) => {
    // Add a delay to prevent cleanup during page refresh
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay

    // Check again after delay in case user rejoined
    if (roomUsers.has(roomId) && roomUsers.get(roomId).size === 0) {
      roomUsers.delete(roomId);
      roomStates.delete(roomId);
      
      // Delete room from database if it exists
      try {
        await Room.findByIdAndDelete(roomId);
        console.log(`Room ${roomId} deleted due to no active users`);
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  socket.on('leave_room', async ({ roomId, userId }) => {
    socket.leave(roomId);
    if (userId) {
      userSocketMap.delete(userId);
    }
    socketUserMap.delete(socket.id);

    // Remove user from room
    if (roomUsers.has(roomId)) {
      roomUsers.get(roomId).delete(socket.id);
      // Send updated users list
      const currentUsers = Array.from(roomUsers.get(roomId).values());
      io.to(roomId).emit('users_update', currentUsers);
      
      // Clean up empty room
      await cleanupEmptyRoom(roomId);
    }
  });

  socket.on('play_track', ({ roomId, trackData, timestamp }) => {
    const roomState = roomStates.get(roomId) || { queue: [], messages: [] };
    roomState.currentTrack = { ...trackData, startTime: timestamp };
    roomState.lastUpdateTime = timestamp;
    roomState.isPlaying = true;
    roomState.currentTime = 0;
    roomStates.set(roomId, roomState);
    
    io.to(roomId).emit('track_update', { trackData, timestamp });
  });

  socket.on('play_state_update', ({ roomId, isPlaying, currentTime }) => {
    const roomState = roomStates.get(roomId);
    if (roomState) {
      roomState.isPlaying = isPlaying;
      roomState.currentTime = currentTime;
      roomState.lastUpdateTime = Date.now();
      roomStates.set(roomId, roomState);

      socket.to(roomId).emit('play_state_update', { isPlaying, currentTime });
    }
  });

  socket.on('sync_request', ({ roomId }) => {
    const roomState = roomStates.get(roomId);
    if (roomState && roomState.currentTrack) {
      const currentTime = Date.now();
      const timeDiff = (currentTime - roomState.lastUpdateTime) / 1000;
      const estimatedTime = roomState.currentTime + (roomState.isPlaying ? timeDiff : 0);
      
      socket.emit('sync_response', {
        track: roomState.currentTrack,
        seekTime: estimatedTime
      });
    }
  });

  socket.on('add_to_queue', ({ roomId, track }) => {
    const roomState = roomStates.get(roomId) || { currentTrack: null, queue: [], messages: [] };
    roomState.queue.push(track);
    roomStates.set(roomId, roomState);
    
    io.to(roomId).emit('queue_update', track);
  });

  socket.on('remove_from_queue', ({ roomId, trackId }) => {
    const roomState = roomStates.get(roomId);
    if (roomState) {
      roomState.queue = roomState.queue.filter(track => track.videoId !== trackId);
      roomStates.set(roomId, roomState);
    }
    io.to(roomId).emit('queue_item_removed', trackId);
  });

  socket.on('chat_message', ({ roomId, message }) => {
    const roomState = roomStates.get(roomId) || { messages: [], queue: [] };
    
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || new Date().toISOString()
    };

    roomState.messages.push(messageWithTimestamp);
    
    if (roomState.messages.length > MAX_MESSAGES) {
      roomState.messages = roomState.messages.slice(-MAX_MESSAGES);
    }
    
    roomStates.set(roomId, roomState);
    io.to(roomId).emit('new_message', messageWithTimestamp);
  });

  socket.on('disconnect', async () => {
    const userId = socketUserMap.get(socket.id);
    if (userId) {
      userSocketMap.delete(userId);
      onlineUsers.delete(userId);
    }
    socketUserMap.delete(socket.id);

    // Remove user from all rooms they were in
    for (const [roomId, users] of roomUsers.entries()) {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        const currentUsers = Array.from(users.values());
        io.to(roomId).emit('users_update', currentUsers);
        
        // Clean up empty room
        await cleanupEmptyRoom(roomId);
      }
    }

    console.log('User disconnected:', socket.id);
  });
});

// Add new endpoint to check online status
app.get('/api/users/:userId/status', (req, res) => {
  const isOnline = onlineUsers.has(req.params.userId);
  res.json({ isOnline });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 