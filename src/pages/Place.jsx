import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Avatar,
  Stack,
  Tooltip,
  Paper,
  Grid,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

const themes = {
  cozyRoom: {
    name: 'Cozy Room',
    image: '/backgrounds/cozy-room.jpg',
    overlay: 'rgba(0, 0, 0, 0.4)',
    accent: '#e8a87c',
    glow: 'rgba(232, 168, 124, 0.3)'
  },
  neonCity: {
    name: 'Neon City',
    image: '/backgrounds/neon-city.jpg',
    overlay: 'rgba(0, 0, 20, 0.5)',
    accent: '#ff1177',
    glow: 'rgba(255, 17, 119, 0.3)'
  },
  lofiCafe: {
    name: 'Lo-Fi Cafe',
    image: '/backgrounds/lofi-cafe.jpg',
    overlay: 'rgba(0, 0, 0, 0.4)',
    accent: '#4b6cb7',
    glow: 'rgba(75, 108, 183, 0.3)'
  },
  retroArcade: {
    name: 'Retro Arcade',
    image: '/backgrounds/retro-arcade.jpg',
    overlay: 'rgba(0, 0, 20, 0.5)',
    accent: '#b827fc',
    glow: 'rgba(184, 39, 252, 0.3)'
  },
  nightSky: {
    name: 'Night Sky',
    image: '/backgrounds/night-sky.jpg',
    overlay: 'rgba(0, 0, 20, 0.4)',
    accent: '#4deba3',
    glow: 'rgba(77, 235, 163, 0.3)'
  },
  jazzClub: {
    name: 'Jazz Club',
    image: '/backgrounds/jazz-club.jpg',
    overlay: 'rgba(0, 0, 0, 0.5)',
    accent: '#e6b32a',
    glow: 'rgba(230, 179, 42, 0.3)'
  }
};

const Place = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();
  const [place, setPlace] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const response = await fetch(`http://localhost:3002/api/places/${placeId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch place');
        }

        const data = await response.json();
        setPlace(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
    
    if (socket) {
      socket.emit('joinPlace', placeId);
      
      socket.on('userJoinedPlace', (user) => {
        setConnectedUsers(prev => [...prev, user]);
      });

      socket.on('userLeftPlace', (userId) => {
        setConnectedUsers(prev => prev.filter(user => user._id !== userId));
      });

      return () => {
        socket.emit('leavePlace', placeId);
        socket.off('userJoinedPlace');
        socket.off('userLeftPlace');
      };
    }
  }, [placeId, socket]);

  const handleInviteFriend = () => {
    // TODO: Implement friend invitation modal
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!place) {
    return <Typography>Place not found</Typography>;
  }

  const theme = themes[place?.theme || 'cozyRoom'];

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        pt: 4,
        pb: 8,
      }}
    >
      <Paper
        sx={{
          p: 4,
          bgcolor: 'rgba(18, 18, 18, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: `0 8px 32px ${theme.accent}20`,
          backgroundImage: `url(${theme.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.overlay,
            zIndex: 1,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h3" 
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 3,
            }}
          >
            {place.name}
          </Typography>

          {place.description && (
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4,
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              {place.description}
            </Typography>
          )}

          <Grid container spacing={3}>
            {/* Add your place content components here */}
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Place; 