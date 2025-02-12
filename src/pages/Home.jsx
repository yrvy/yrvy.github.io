import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  useTheme
} from '@mui/material';
import { PlayArrow as PlayArrowIcon, Person as PersonIcon, Headphones as HeadphonesIcon, MusicNote as MusicNoteIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { keyframes } from '@mui/system';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const FeatureCard = ({ icon: Icon, title, description }) => (
  <Card sx={{ 
    height: '100%', 
    bgcolor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
    }
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        color: 'primary.main'
      }}>
        <Icon sx={{ fontSize: 32, mr: 1 }} />
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/rooms');
        if (response.ok) {
          const data = await response.json();
          setRooms(data);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    // Add Inter font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleCreateRoom = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: `${user.username}'s Room`,
          isPrivate: false
        })
      });

      if (response.ok) {
        const room = await response.json();
        navigate(`/room/${room._id}`);
      } else {
        console.error('Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleJoinRoom = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 50%, rgba(29, 185, 84, 0.1) 0%, rgba(18, 18, 18, 0) 50%)',
      pt: 8
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          py: { xs: 8, md: 12 },
          mb: 6
        }}>
          <Typography 
            component="h1"
            variant="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '4rem' },
              mb: 2,
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1db954 30%, #4deba3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              letterSpacing: '-0.02em',
              animation: `${fadeInUp} 1s ease-out`,
            }}
          >
            Watch Together,<br />Anywhere
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 6,
              opacity: 0.7,
              letterSpacing: '0.5px',
              animation: `${fadeInUp} 1s ease-out 0.3s backwards`
            }}
          >
            Create rooms, invite friends, and enjoy synchronized video watching
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center',
            mb: 6,
            animation: `${fadeInUp} 1s ease-out 0.5s backwards`
          }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/room/new')}
              sx={{
                bgcolor: 'rgba(29, 185, 84, 0.8)',
                backdropFilter: 'blur(10px)',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(29, 185, 84, 1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(29, 185, 84, 0.3)'
                }
              }}
            >
              Create Public Room
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/place/new')}
              sx={{
                borderColor: 'rgba(29, 185, 84, 0.8)',
                color: '#1db954',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#1db954',
                  bgcolor: 'rgba(29, 185, 84, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(29, 185, 84, 0.1)'
                }
              }}
            >
              Create Place
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={HeadphonesIcon}
                title="Perfect Sync"
                description="Watch videos in perfect synchronization with your friends, no matter where they are."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={MusicNoteIcon}
                title="Shared Queue"
                description="Build a collaborative playlist where everyone can add their favorite videos."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={PersonIcon}
                title="Real-time Chat"
                description="Chat with your friends while watching, share reactions, and have fun together."
              />
            </Grid>
          </Grid>
        </Box>

        {/* Active Rooms Section */}
        {rooms.length > 0 && (
          <Box sx={{ mb: 8 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Active Rooms
            </Typography>
            <Grid container spacing={3}>
              {rooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room._id}>
                  <Card
                    sx={{
                      height: '100%',
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                      }
                    }}
                    onClick={() => handleJoinRoom(room._id)}
                  >
                    {room.currentTrack && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={room.currentTrack.thumbnail}
                        alt={room.currentTrack.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        {room.name}
                      </Typography>
                      {room.currentTrack && (
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 2 }}>
                          {room.currentTrack.title}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          icon={<PersonIcon />}
                          label={`${room.listeners.length} watching`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiChip-icon': { color: 'primary.main' }
                          }}
                        />
                        {room.isPrivate && (
                          <Chip
                            label="Private"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {!loading && rooms.length === 0 && (
          <Box 
            sx={{ 
              textAlign: 'center',
              py: 8,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No active rooms
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Be the first to create a room and invite your friends!
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={handleCreateRoom}
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none'
              }}
            >
              Create Room
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home; 