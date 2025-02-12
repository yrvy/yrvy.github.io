import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const MyPlaces = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/places/my-places', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch places');
        }
        
        const data = await response.json();
        console.log('Fetched places:', data); // Debug log
        setPlaces(data);
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only redirect if auth is finished loading and there's no user
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    // Only fetch if we have a user
    if (user) {
      fetchPlaces();
    }
  }, [user, navigate, authLoading]);

  const handleDeletePlace = async (placeId) => {
    try {
      const response = await fetch(`http://localhost:3002/api/places/${placeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setPlaces(places.filter(place => place._id !== placeId));
      }
    } catch (error) {
      console.error('Error deleting place:', error);
    }
  };

  // Show loading while either auth is loading or places are loading
  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          My Places
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/place/new')}
        >
          Create Place
        </Button>
      </Box>

      {places.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't created any places yet
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/place/new')}
            sx={{ mt: 2 }}
          >
            Create Your First Place
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {places.map((place) => (
            <Grid item xs={12} sm={6} md={4} key={place._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={place.background || '/default-background.jpg'}
                  alt={place.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" component="h2" gutterBottom>
                      {place.name}
                    </Typography>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/place/${place._id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePlace(place._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" mt={1}>
                    <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {place.connectedUsers?.length || 0} connected
                    </Typography>
                  </Box>
                  {place.isPrivate && (
                    <Chip
                      label="Private"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
                <Box p={2} pt={0}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate(`/place/${place._id}`)}
                  >
                    Join
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyPlaces; 