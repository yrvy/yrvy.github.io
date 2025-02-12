import { fetchWithTimeout } from '../utils/api';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  CircularProgress,
  Stack,
  Container,
  useTheme as useMuiTheme
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import FloatingChat from './FloatingChat';

const Logo = () => {
  const [currentFontIndex, setCurrentFontIndex] = useState(0);

  const fonts = [
    '"Rubik", sans-serif',
    '"Righteous", cursive',
    '"Fredoka One", cursive',
    '"Changa One", cursive',
    '"Bungee", cursive',
    '"Black Ops One", cursive',
    '"Bowlby One SC", cursive',
    '"Press Start 2P", cursive',
    '"VT323", monospace',
    '"Silkscreen", cursive'
  ];

  const handleMouseEnter = () => {
    setCurrentFontIndex(prev => (prev + 1) % fonts.length);
  };

  return (
    <Typography
      variant="h5"
      component={RouterLink}
      to="/"
      sx={{
        flexGrow: 1,
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: 'white',
      }}
    >
      <Box
        component="span"
        onMouseEnter={handleMouseEnter}
        sx={{
          background: 'linear-gradient(135deg, #1db954, #4deba3)',
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(29, 185, 84, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '"2"',
            fontFamily: fonts[currentFontIndex],
            fontSize: fonts[currentFontIndex].includes('Press Start 2P') ? '1.8rem' : '2.4rem',
            fontWeight: 'bold',
            color: '#fff',
            position: 'absolute',
            background: 'linear-gradient(135deg, #ffffff, rgba(255, 255, 255, 0.9))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.2))`,
            transition: 'all 0.15s ease-in-out',
          }
        }}
      />
    </Typography>
  );
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useMuiTheme();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleCreateRoom = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetchWithTimeout('http://localhost:3002/api/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')})`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${user.username}'s Room`,
          isPrivate: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const room = await response.json();
      navigate(`/room/${room._id}`);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          bgcolor: 'rgba(18, 18, 18, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '2px solid rgba(29, 185, 84, 0.1)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ gap: 2, py: 1 }}>
            <Logo />

            <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 'auto' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateRoom}
                sx={{ 
                  borderRadius: '20px',
                  px: 3,
                  py: 1,
                  bgcolor: '#1db954',
                  color: '#ffffff',
                  fontFamily: '"Quicksand", sans-serif',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: '0 2px 8px rgba(29, 185, 84, 0.2)',
                  '&:hover': {
                    bgcolor: '#1ed760',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(29, 185, 84, 0.3)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Create Room
              </Button>

              {user ? (
                <>
                  <NotificationBell />
                  <Tooltip title={user.username}>
                    <IconButton
                      onClick={handleMenu}
                      sx={{ 
                        p: 0.5,
                        border: '2px solid rgba(29, 185, 84, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          border: '2px solid #1db954'
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32,
                          bgcolor: '#1db954',
                          fontFamily: '"Quicksand", sans-serif',
                          fontWeight: 600
                        }}
                        src={user.profilePicture}
                      >
                        {!user.profilePicture && user.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: {
                        bgcolor: 'rgba(18, 18, 18, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(29, 185, 84, 0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                        mt: 1.5,
                        '& .MuiMenuItem-root': {
                          fontFamily: '"Quicksand", sans-serif',
                          fontSize: '0.95rem',
                          py: 1.5,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'rgba(29, 185, 84, 0.1)',
                            transform: 'translateX(4px)'
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem onClick={handleClose} component={RouterLink} to="/settings">Settings</MenuItem>
                    <MenuItem onClick={handleClose} component={RouterLink} to="/my-places">My Places</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    component={RouterLink} 
                    to="/login"
                    sx={{ 
                      borderRadius: '20px',
                      px: 3,
                      color: '#fff',
                      fontFamily: '"Quicksand", sans-serif',
                      fontWeight: 600,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="contained" 
                    component={RouterLink} 
                    to="/register"
                    sx={{ 
                      borderRadius: '20px',
                      px: 3,
                      bgcolor: '#1db954',
                      fontFamily: '"Quicksand", sans-serif',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(29, 185, 84, 0.2)',
                      '&:hover': {
                        bgcolor: '#1ed760',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(29, 185, 84, 0.3)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Sign Up
                  </Button>
                </Box>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          mt: { xs: 7, sm: 8 }, 
          p: { xs: 2, sm: 3 },
          bgcolor: '#121212'
        }}
      >
        {children}
      </Box>

      {user && <FloatingChat />}
    </Box>
  );
};

export default Layout; 