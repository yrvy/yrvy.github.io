import { fetchWithTimeout } from '../utils/api';
import { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Badge,
  Typography,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const socket = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();

    if (socket) {
      socket.on('friend_request', handleNewFriendRequest);
      socket.on('friend_request_response', handleFriendRequestResponse);
      socket.on('friend_removed', handleFriendRemoved);
    }

    return () => {
      if (socket) {
        socket.off('friend_request');
        socket.off('friend_request_response');
        socket.off('friend_removed');
      }
    };
  }, [socket]);

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

  const fetchFriendRequests = async () => {
    try {
      const response = await fetchWithTimeout('http://localhost:3002/api/auth/friends/requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')})`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleNewFriendRequest = (request) => {
    setFriendRequests(prev => [...prev, request]);
    setSnackbar({
      open: true,
      message: `New friend request from ${request.displayName || request.username}`,
      severity: 'info'
    });
  };

  const handleFriendRequestResponse = (response) => {
    if (response.accepted) {
      setFriends(prev => [...prev, response.user]);
      setSnackbar({
        open: true,
        message: `${response.user.displayName || response.user.username} accepted your friend request`,
        severity: 'success'
      });
    }
  };

  const handleFriendRemoved = (user) => {
    setFriends(prev => prev.filter(friend => friend._id !== user.id));
    setSnackbar({
      open: true,
      message: `${user.displayName || user.username} removed you as a friend`,
      severity: 'info'
    });
  };

  const handleAcceptRequest = async (userId) => {
    try {
      const response = await fetchWithTimeout('http://localhost:3002/api/auth/friends/accept/${userId}', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')})`
        }
      });
      
      if (response.ok) {
        setFriendRequests(prev => prev.filter(request => request._id !== userId));
        fetchFriends();
        setSnackbar({
          open: true,
          message: 'Friend request accepted',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await fetchWithTimeout('http://localhost:3002/api/auth/friends/reject/${userId}', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')})`
        }
      });
      
      setFriendRequests(prev => prev.filter(request => request._id !== userId));
      setSnackbar({
        open: true,
        message: 'Friend request rejected',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      const response = await fetchWithTimeout('http://localhost:3002/api/auth/friends/remove/${userId}', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')})`
        }
      });
      
      if (response.ok) {
        setFriends(prev => prev.filter(friend => friend._id !== userId));
        setSnackbar({
          open: true,
          message: 'Friend removed',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
    handleCloseMenu();
  };

  const handleOpenMenu = (event, friend) => {
    setAnchorEl(event.currentTarget);
    setSelectedFriend(friend);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedFriend(null);
  };

  const handleProfileClick = (username) => {
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
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(45deg, rgba(29, 185, 84, 0.1), rgba(77, 235, 163, 0.1))',
          backdropFilter: 'blur(20px)'
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#1db954'
          }}
        >
          Friends ({friends.length})
        </Typography>
      </Box>

      <List
        sx={{
          p: 1,
          overflow: 'auto',
          flexGrow: 1,
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
        {friends.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              color: 'text.secondary',
              fontFamily: '"Quicksand", sans-serif'
            }}
          >
            No friends yet
          </Box>
        ) : (
          friends.map((friend) => (
            <ListItem
              key={friend._id}
              sx={{
                borderRadius: '8px',
                mb: 0.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  transform: 'translateX(4px)'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={friend.profilePicture || getDefaultAvatar(friend.username)}
                  sx={{
                    width: 40,
                    height: 40,
                    border: friend.isOnline ? '2px solid #1db954' : '2px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      borderColor: '#1db954'
                    }
                  }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontFamily: '"Space Grotesk", sans-serif',
                      fontWeight: 500,
                      fontSize: '0.95rem'
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
          ))
        )}
      </List>
    </Paper>
  );
};

export default FriendList; 