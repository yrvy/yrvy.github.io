import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Skeleton,
  Button
} from '@mui/material';
import {
  Headphones as HeadphonesIcon,
  MusicNote as MusicNoteIcon,
  AccessTime as AccessTimeIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [friendStatus, setFriendStatus] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:3002/api/auth/users/${username}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const checkFriendStatus = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`http://localhost:3002/api/auth/friends`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const friends = await response.json();
          const isFriend = friends.some(friend => friend.username === username);
          
          if (isFriend) {
            setFriendStatus('friends');
          } else {
            const requestsResponse = await fetch(`http://localhost:3002/api/auth/friends/requests`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (requestsResponse.ok) {
              const requests = await requestsResponse.json();
              const isPending = requests.some(request => request.username === username);
              setFriendStatus(isPending ? 'pending' : 'none');
            }
          }
        }
      } catch (error) {
        console.error('Error checking friend status:', error);
      }
    };

    fetchProfile();
    checkFriendStatus();
  }, [username]);

  const getDefaultAvatar = (username) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=1DB954&color=fff&size=200`;
  };

  const handleSendFriendRequest = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/auth/friends/request/${profile._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setFriendStatus('pending');
        setSnackbar({
          open: true,
          message: 'Friend request sent',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/auth/friends/remove/${profile._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setFriendStatus('none');
        setSnackbar({
          open: true,
          message: 'Friend removed',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Skeleton variant="circular" width={200} height={200} sx={{ mr: 4 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="40%" height={30} />
            </Box>
          </Box>
          <Skeleton variant="rectangular" height={100} />
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom color="text.secondary">
            User Not Found
          </Typography>
          <Typography color="text.secondary">
            The user "{username}" doesn't exist or has deleted their account.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 3 }}
          >
            Go Home
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!profile) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ 
        p: 4,
        bgcolor: 'rgba(18, 18, 18, 0.15)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.03)',
        borderRadius: '16px',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.15),
          0 4px 24px rgba(29, 185, 84, 0.03),
          0 2px 8px rgba(29, 185, 84, 0.02)
        `,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: '16px',
          padding: '1px',
          background: 'linear-gradient(45deg, rgba(29, 185, 84, 0.07), rgba(77, 235, 163, 0.02))',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4 }}>
          <Avatar
            src={profile.profilePicture || getDefaultAvatar(profile.username)}
            sx={{
              width: 200,
              height: 200,
              mr: 4,
              border: '4px solid',
              borderColor: 'primary.main'
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" gutterBottom sx={{ 
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              fontSize: '3rem',
              background: 'linear-gradient(45deg, #1db954 30%, #4deba3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0
            }}>
              {profile.displayName || profile.username}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 800,
              fontSize: '1.5rem',
              letterSpacing: '-0.01em',
              opacity: 0.9,
              mt: -1
            }}>
              @{profile.username}
            </Typography>
            {profile.bio && (
              <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                {profile.bio}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Chip
                icon={<HeadphonesIcon />}
                label={profile.currentRoom ? 'Currently Listening' : 'Offline'}
                color={profile.currentRoom ? 'success' : 'default'}
              />
              <Chip
                icon={<AccessTimeIcon />}
                label={`Joined ${new Date(profile.createdAt).toLocaleDateString()}`}
              />
            </Box>
            {user && user.id !== profile?._id && (
              <Box sx={{ mt: 2 }}>
                {friendStatus === 'none' && (
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={handleSendFriendRequest}
                  >
                    Add Friend
                  </Button>
                )}
                {friendStatus === 'pending' && (
                  <Button
                    variant="outlined"
                    disabled
                  >
                    Friend Request Sent
                  </Button>
                )}
                {friendStatus === 'friends' && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleRemoveFriend}
                  >
                    Remove Friend
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Recently Played
            </Typography>
            <List>
              {profile.recentlyPlayed?.slice(0, 5).map((track, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar variant="rounded" src={track.thumbnail} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={track.title}
                    secondary={new Date(track.playedAt).toLocaleString()}
                  />
                </ListItem>
              ))}
              {(!profile.recentlyPlayed || profile.recentlyPlayed.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  No recently played tracks
                </Typography>
              )}
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Favorite Rooms
            </Typography>
            <List>
              {profile.favoriteRooms?.slice(0, 5).map((room, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>
                      <MusicNoteIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={room.name}
                    secondary={`Created by ${room.creator.username}`}
                  />
                </ListItem>
              ))}
              {(!profile.favoriteRooms || profile.favoriteRooms.length === 0) && (
                <Typography variant="body2" color="text.secondary">
                  No favorite rooms yet
                </Typography>
              )}
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile; 