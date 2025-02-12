import { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Box,
  Button,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useSocket } from '../hooks/useSocket';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    fetchFriendRequests();

    if (socket) {
      socket.on('friend_request', handleNewFriendRequest);
    }

    return () => {
      if (socket) {
        socket.off('friend_request');
      }
    };
  }, [socket]);

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/auth/friends/requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
  };

  const handleAcceptRequest = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3002/api/auth/friends/accept/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setFriendRequests(prev => prev.filter(request => request._id !== userId));
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await fetch(`http://localhost:3002/api/auth/friends/reject/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setFriendRequests(prev => prev.filter(request => request._id !== userId));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ color: 'var(--text)' }}
      >
        <Badge badgeContent={friendRequests.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            bgcolor: 'var(--surface)',
            color: 'var(--text)'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
        </Box>
        <Divider />
        {friendRequests.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </MenuItem>
        ) : (
          friendRequests.map(request => (
            <MenuItem key={request._id} sx={{ py: 1 }}>
              <ListItemAvatar>
                <Avatar src={request.profilePicture}>
                  {request.username[0].toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body1" noWrap>
                    {request.displayName || request.username}
                  </Typography>
                }
                secondary="Sent you a friend request"
              />
              <Box sx={{ ml: 1 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleAcceptRequest(request._id)}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRejectRequest(request._id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell; 