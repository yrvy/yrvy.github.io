import { useState, useEffect, useRef } from 'react';
import { Box, Paper, TextField, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Chat = ({ roomId, socket }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on('room_state', (state) => {
        if (state.messages) {
          setMessages(state.messages);
        }
      });

      return () => {
        socket.off('new_message');
        socket.off('room_state');
      };
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && socket && user) {
      const messageData = {
        roomId,
        message: {
          text: message,
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          profilePicture: user.profilePicture,
          timestamp: new Date().toISOString()
        }
      };
      socket.emit('chat_message', messageData);
      setMessage('');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getDefaultAvatar = (username) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=1DB954&color=fff`;
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <Paper 
      sx={{ 
        height: '100%', 
        bgcolor: 'rgba(40, 40, 40, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        p: 2,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#1db954',
          textAlign: 'center',
          mb: 2,
          background: 'linear-gradient(45deg, #1db954 30%, #4deba3 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}
      >
        Chat Room
      </Typography>
      
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <List sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
          mb: 2,
          px: 1,
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
        }}>
          {messages.map((msg, index) => (
            <ListItem 
              key={msg.timestamp + index} 
              sx={{ 
                py: 0.5,
                px: 1,
                transition: 'all 0.2s ease',
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  transform: 'translateX(4px)'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={msg.profilePicture || getDefaultAvatar(msg.username)}
                  alt={msg.displayName || msg.username}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    border: msg.userId === user?.id ? '2px solid #1db954' : '2px solid transparent',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      borderColor: '#1db954'
                    }
                  }}
                  onClick={() => handleUserClick(msg.username)}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box component="span" sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography
                      component="span"
                      sx={{
                        color: msg.userId === user?.id ? '#1db954' : 'text.primary',
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: msg.userId === user?.id ? 600 : 500,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                      onClick={() => handleUserClick(msg.username)}
                    >
                      {msg.displayName || msg.username}
                    </Typography>
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontFamily: '"Quicksand", sans-serif',
                        fontSize: '0.75rem'
                      }}
                    >
                      {formatTime(msg.timestamp)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontFamily: '"Quicksand", sans-serif',
                      fontSize: '0.9rem',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.4
                    }}
                  >
                    {msg.text}
                  </Typography>
                }
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
        
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{
            mt: 'auto',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -20,
              left: 0,
              right: 0,
              height: '20px',
              background: 'linear-gradient(to top, rgba(40, 40, 40, 0.5), transparent)',
              pointerEvents: 'none'
            }
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                fontFamily: '"Quicksand", sans-serif',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                '& fieldset': {
                  borderColor: 'rgba(29, 185, 84, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(29, 185, 84, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1db954',
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: '12px 16px',
              }
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default Chat; 