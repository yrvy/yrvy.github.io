import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Alert,
  Radio,
  RadioGroup,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../contexts/AuthContext';
import { Lock as LockIcon, Public as PublicIcon } from '@mui/icons-material';

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

const BackgroundOption = styled(Paper)(({ theme, selected }) => ({
  position: 'relative',
  height: 150,
  cursor: 'pointer',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'transform 0.2s ease-in-out',
  border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
  '&:hover': {
    transform: 'scale(1.02)',
  },
  '& .MuiTypography-root': {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(1),
    background: 'rgba(0, 0, 0, 0.7)',
    color: theme.palette.common.white,
    textAlign: 'center'
  },
  '& .MuiSvgIcon-root': {
    position: 'absolute',
    top: 8,
    right: 8,
    color: theme.palette.primary.main
  }
}));

const CreateButton = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabled,
    cursor: 'not-allowed'
  }
}));

const NewPlace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('cozyRoom');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Creating place with:', { name, description, isPrivate, password, selectedTheme }); // Debug log

      const response = await fetch('http://localhost:3002/api/places', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          isPrivate,
          password: isPrivate ? password : undefined,
          theme: selectedTheme
        })
      });

      const data = await response.json();
      console.log('Server response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create place');
      }

      navigate(`/place/${data._id}`);
    } catch (error) {
      console.error('Error creating place:', error);
      setError(error.message || 'Failed to create place. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          p: 4,
          bgcolor: 'rgba(18, 18, 18, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}
      >
        <Typography variant="h4" gutterBottom sx={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          background: 'linear-gradient(45deg, #1db954, #4deba3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Create a New Place
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Place Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Select Theme
            </Typography>
            <RadioGroup
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}
            >
              {Object.entries(themes).map(([key, theme]) => (
                <Paper
                  key={key}
                  sx={{
                    width: 200,
                    height: 120,
                    position: 'relative',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    border: selectedTheme === key ? `2px solid ${theme.accent}` : '2px solid transparent',
                    boxShadow: selectedTheme === key ? `0 0 20px ${theme.accent}40` : 'none',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 0 20px ${theme.accent}40`
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `url(${theme.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: theme.overlay,
                      transition: 'opacity 0.3s ease',
                      '&:hover': {
                        opacity: 0.7
                      }
                    }}
                  />
                  <Radio
                    value={key}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                      }
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      color: 'white',
                      fontWeight: 600,
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}
                  >
                    {theme.name}
                  </Typography>
                </Paper>
              ))}
            </RadioGroup>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                }
                label="Private Place"
              />
              {isPrivate && (
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={isPrivate}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || !name.trim()}
              sx={{
                mt: 3,
                height: 48,
                background: `linear-gradient(45deg, ${themes[selectedTheme].accent}, ${alpha(themes[selectedTheme].accent, 0.8)})`,
                boxShadow: `0 0 20px ${themes[selectedTheme].accent}40`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(themes[selectedTheme].accent, 0.9)}, ${alpha(themes[selectedTheme].accent, 0.7)})`,
                }
              }}
            >
              {loading ? 'Creating...' : 'Create Place'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default NewPlace; 