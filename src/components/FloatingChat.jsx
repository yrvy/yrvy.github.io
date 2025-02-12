import { fetchWithTimeout } from '../utils/api';
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Badge,
  Collapse,
  Stack,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandLess,
  ExpandMore,
  Send as SendIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { useSocket } from '../hooks/useSocket';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFriendsList } from '../store';

const ChatWindow = ({ friend, onClose, socket }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (socket) {
      // Fetch chat history
      socket.emit('fetch_messages', { friendId: friend._id });

      // Listen for chat history
      socket.on(`chat_history_${friend._id}`, (messages) => {
        setMessages(messages);
      });

      // Listen for new messages from friend
      socket.on(`private_message_${friend._id}`, (msg) => {
        setMessages(prev => [...prev, msg]);
        socket.emit('mark_messages_read', { friendId: friend._id });
      });

      // Listen for sent message confirmations
      socket.on(`message_sent_${friend._id}`, (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      // Mark messages as read when opening chat
      socket.emit('mark_messages_read', { friendId: friend._id });
    }

    return () => {
      if (socket) {
        socket.off(`chat_history_${friend._id}`);
        socket.off(`private_message_${friend._id}`);
        socket.off(`message_sent_${friend._id}`);
      }
    };
  }, [socket, friend._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit('private_message', {
        to: friend._id,
        text: message.trim()
      });
      setMessage('');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString([], { 
      month: 'short',
      day: 'numeric'
    });
  };

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(msg => {
      const date = new Date(msg.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 320,
        height: isMinimized ? 'auto' : 450,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: '12px 12px 0 0',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Box
        sx={{
          p: 1.5,
          bgcolor: '#1db954',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: friend.isOnline ? '#44b700' : '#666',
                color: friend.isOnline ? '#44b700' : '#666',
                boxShadow: '0 0 0 2px #282828',
                '&::after': {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  animation: friend.isOnline ? 'ripple 1.2s infinite ease-in-out' : 'none',
                  border: '1px solid currentColor',
                  content: '""',
                },
              },
              '@keyframes ripple': {
                '0%': {
                  transform: 'scale(.8)',
                  opacity: 1,
                },
                '100%': {
                  transform: 'scale(2.4)',
                  opacity: 0,
                },
              },
            }}
          >
            <Avatar
              src={friend.profilePicture}
              sx={{ width: 32, height: 32 }}
            >
              {friend.username[0].toUpperCase()}
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {friend.displayName || friend.username}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {friend.isOnline ? 'Active now' : 'Offline'}
            </Typography>
          </Box>
        </Stack>
        <Box>
          {isMinimized ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />}
          <IconButton size="small" onClick={onClose} sx={{ color: 'white', ml: 1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={!isMinimized} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <List 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto', 
            p: 2,
            bgcolor: '#121212',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
            },
          }}
        >
          {Object.entries(groupMessagesByDate()).map(([date, msgs]) => (
            <Box key={date}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  color: 'text.secondary',
                  my: 2
                }}
              >
                {formatDate(date)}
              </Typography>
              {msgs.map((msg, index) => (
                <Box
                  key={msg._id || index}
                  sx={{
                    display: 'flex',
                    flexDirection: msg.from?._id === friend._id ? 'row' : 'row-reverse',
                    mb: 1.5,
                    gap: 1
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '75%',
                      minWidth: '20%',
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: msg.from?._id === friend._id ? '#282828' : '#1db954',
                        color: msg.from?._id === friend._id ? 'white' : 'white',
                        p: 1.5,
                        borderRadius: msg.from?._id === friend._id 
                          ? '16px 16px 16px 4px'
                          : '16px 16px 4px 16px',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        wordBreak: 'break-word'
                      }}
                    >
                      <Typography variant="body2">
                        {msg.text}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        color: 'text.secondary',
                        textAlign: msg.from?._id === friend._id ? 'left' : 'right'
                      }}
                    >
                      {formatTime(msg.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </List>

        <Box 
          component="form" 
          onSubmit={handleSend} 
          sx={{ 
            p: 2, 
            bgcolor: '#282828',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                  },
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1db954',
                  },
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                },
              }}
            />
            <IconButton 
              type="submit" 
              sx={{ 
                bgcolor: '#1db954',
                color: 'white',
                '&:hover': {
                  bgcolor: '#1ed760',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

const FloatingChat = () => {
  const [friends, setFriends] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const dispatch = useDispatch();
  const isMinimized = useSelector(state => state.chat.uiPreferences.isFriendsListMinimized);
  const socket = useSocket();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetchWithTimeout('http://localhost:3002/api/auth/friends', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')})`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const handleStartChat = (friend) => {
    if (!activeChats.find(chat => chat._id === friend._id)) {
      setActiveChats(prev => [...prev, friend]);
    }
  };

  const handleCloseChat = (friendId) => {
    setActiveChats(prev => prev.filter(chat => chat._id !== friendId));
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 0, right: 20, zIndex: 1000 }}>
      <Stack direction="row" spacing={2} alignItems="flex-end">
        {/* Active chat windows */}
        {activeChats.map(friend => (
          <ChatWindow
            key={friend._id}
            friend={friend}
            onClose={() => handleCloseChat(friend._id)}
            socket={socket}
          />
        ))}

        {/* Friends list */}
        <Paper
          sx={{
            width: 250,
            height: !isMinimized ? 400 : 'auto',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'rgba(40, 40, 40, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px 12px 0 0',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Box
            sx={{
              p: 1.5,
              background: 'linear-gradient(45deg, rgba(29, 185, 84, 0.95), rgba(77, 235, 163, 0.95))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onClick={() => dispatch(toggleFriendsList())}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'white',
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 600,
                fontSize: '0.95rem',
                letterSpacing: '0.02em'
              }}
            >
              Friends ({friends.length})
            </Typography>
            {!isMinimized ? 
              <ExpandMore sx={{ color: 'white' }} /> : 
              <ExpandLess sx={{ color: 'white' }} />
            }
          </Box>

          <Collapse in={!isMinimized}>
            <List 
              sx={{ 
                maxHeight: 350, 
                overflow: 'auto',
                bgcolor: 'rgba(40, 40, 40, 0.5)',
                backdropFilter: 'blur(10px)',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(29, 185, 84, 0.3)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'rgba(29, 185, 84, 0.5)',
                  },
                },
              }}
            >
              {friends.map(friend => (
                <ListItem
                  key={friend._id}
                  button
                  onClick={() => handleStartChat(friend)}
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: friend.isOnline ? '#1db954' : '#666',
                          color: friend.isOnline ? '#1db954' : '#666',
                          boxShadow: '0 0 0 2px rgba(40, 40, 40, 0.8)',
                          '&::after': {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            animation: friend.isOnline ? 'ripple 1.2s infinite ease-in-out' : 'none',
                            border: '1px solid currentColor',
                            content: '""',
                          },
                        },
                        '@keyframes ripple': {
                          '0%': {
                            transform: 'scale(.8)',
                            opacity: 1,
                          },
                          '100%': {
                            transform: 'scale(2.4)',
                            opacity: 0,
                          },
                        },
                      }}
                    >
                      <Avatar 
                        src={friend.profilePicture}
                        sx={{
                          width: 40,
                          height: 40,
                          border: '2px solid transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#1db954',
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        {friend.username[0].toUpperCase()}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontFamily: '"Space Grotesk", sans-serif',
                          fontWeight: 500,
                          fontSize: '0.95rem',
                          color: 'white'
                        }}
                      >
                        {friend.displayName || friend.username}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: friend.isOnline ? '#1db954' : 'text.secondary',
                          fontFamily: '"Quicksand", sans-serif',
                          fontSize: '0.8rem'
                        }}
                      >
                        {friend.isOnline ? 'Online' : 'Offline'}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
              {friends.length === 0 && (
                <ListItem>
                  <ListItemText
                    secondary={
                      <Typography
                        sx={{
                          textAlign: 'center',
                          color: 'text.secondary',
                          fontFamily: '"Quicksand", sans-serif',
                          fontSize: '0.9rem',
                          py: 2
                        }}
                      >
                        No friends yet
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Collapse>
        </Paper>
      </Stack>
    </Box>
  );
};

export default FloatingChat; 