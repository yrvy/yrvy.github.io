import { useState } from 'react';
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
  Stack
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

const Logo = () => (
  <Typography
    variant="h5"
    component={RouterLink}
    to="/"
    sx={{
      flexGrow: 1,
      textDecoration: 'none',
      color: 'var(--primary)',
      fontWeight: 800,
      letterSpacing: '-1px',
      fontFamily: '"Inter", sans-serif',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      '&:hover': {
        color: 'var(--secondary)',
      }
    }}
  >
    <Box
      component="span"
      sx={{
        background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
        borderRadius: '8px',
        padding: '4px 8px',
        color: 'white',
        fontSize: '1.2rem',
        fontWeight: 900,
        letterSpacing: '-0.5px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
      }}
    >
      2G
    </Box>
    ther
  </Typography>
);

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleCreateRoom = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const roomId = Math.random().toString(36).substring(7);
    navigate(`/room/${roomId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          bgcolor: 'var(--surface)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Logo />

          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              color="primary"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateRoom}
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none',
                px: 3,
                py: 1,
                bgcolor: 'var(--primary)',
                '&:hover': {
                  bgcolor: 'var(--secondary)',
                }
              }}
            >
              Create Room
            </Button>

            <ThemeSwitcher />

            {user ? (
              <>
                <Tooltip title={user.username}>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    sx={{ color: 'var(--text)' }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: 'var(--primary)',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                      src={user.profilePicture}
                    >
                      {!user.profilePicture && user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      bgcolor: 'var(--surface)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    }
                  }}
                >
                  <MenuItem onClick={handleClose} component={RouterLink} to="/settings">Settings</MenuItem>
                  <MenuItem onClick={handleClose}>My Rooms</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/login"
                  sx={{ 
                    borderRadius: '20px',
                    textTransform: 'none',
                    px: 3,
                    color: 'var(--text)'
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
                    textTransform: 'none',
                    px: 3,
                    bgcolor: 'var(--primary)',
                    '&:hover': {
                      bgcolor: 'var(--secondary)',
                    }
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, mt: 8, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 