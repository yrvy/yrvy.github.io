const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');

const userSocketMap = new Map();

module.exports = (io) => {
  io.onlineUsers = new Set();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const userId = socket.handshake.auth.userId;

      if (!token || !userId) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.userId !== userId) {
        return next(new Error('Invalid user'));
      }

      socket.userId = userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    userSocketMap.set(userId, socket.id);
    io.onlineUsers.add(userId);

    // Update user's online status in DB
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }

    // Handle fetching chat history
    socket.on('fetch_messages', async ({ friendId }) => {
      try {
        const messages = await Message.find({
          $or: [
            { from: userId, to: friendId },
            { from: friendId, to: userId }
          ]
        })
        .sort('createdAt')
        .limit(50);

        socket.emit(`chat_history_${friendId}`, messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    });

    // Handle private messages
    socket.on('private_message', async (data) => {
      try {
        // Save message to database
        const message = new Message({
          from: userId,
          to: data.to,
          text: data.text
        });
        await message.save();

        const sender = await User.findById(userId)
          .select('username displayName profilePicture');

        const messageData = {
          _id: message._id,
          from: {
            _id: userId,
            username: sender.username,
            displayName: sender.displayName,
            profilePicture: sender.profilePicture
          },
          text: data.text,
          createdAt: message.createdAt
        };

        // Send to recipient if online
        const recipientSocketId = userSocketMap.get(data.to);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit(`private_message_${userId}`, messageData);
        }

        // Send confirmation back to sender
        socket.emit(`message_sent_${data.to}`, messageData);
      } catch (error) {
        console.error('Error handling private message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle marking messages as read
    socket.on('mark_messages_read', async ({ friendId }) => {
      try {
        await Message.updateMany(
          { from: friendId, to: userId, read: false },
          { read: true }
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('disconnect', async () => {
      userSocketMap.delete(userId);
      io.onlineUsers.delete(userId);

      // Update user's online status and last seen in DB
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Error updating user offline status:', error);
      }
    });
  });
}; 