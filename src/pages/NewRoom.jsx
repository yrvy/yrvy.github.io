import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const NewRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    isPrivate: false,
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isPrivate' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3002/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const room = await response.json();
        navigate(`/room/${room._id}`);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create room');
      }
    } catch (err) {
      setError('Failed to create room');
      console.error('Error creating room:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        mt: 8, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center'
      }}>
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            textAlign: 'center',
            background: 'linear-gradient(45deg, #1db954, #4deba3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Create Public Room
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            '& > :not(style)': { mb: 3 },
          }}
        >
          <TextField
            fullWidth
            label="Room Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                '&:hover fieldset': {
                  borderColor: 'rgba(29, 185, 84, 0.5)',
                },
              },
            }}
          />

          <FormControlLabel
            control={
              <Switch
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Private Room"
          />

          {formData.isPrivate && (
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={formData.isPrivate}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  '&:hover fieldset': {
                    borderColor: 'rgba(29, 185, 84, 0.5)',
                  },
                },
              }}
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'rgba(29, 185, 84, 0.8)',
              backdropFilter: 'blur(10px)',
              py: 1.5,
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(29, 185, 84, 1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(29, 185, 84, 0.3)',
              },
            }}
          >
            Create Room
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NewRoom; 