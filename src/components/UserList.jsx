import { Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Tooltip, Box } from '@mui/material';
import { Person as PersonIcon, MusicNote as MusicNoteIcon, Star as StarIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const UserList = ({ users }) => {
  const navigate = useNavigate();

  // Remove duplicate users based on username
  const uniqueUsers = users.reduce((acc, user) => {
    const existingUser = acc.find(u => u.username === user.username);
    if (!existingUser) {
      acc.push(user);
    }
    return acc;
  }, []);

  const getDefaultAvatar = (username) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=1DB954&color=fff`;
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <Paper sx={{ height: '100%', bgcolor: 'background.paper', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Listeners ({uniqueUsers.length})
      </Typography>
      <List sx={{ overflow: 'auto', maxHeight: 'calc(100% - 48px)' }}>
        {uniqueUsers.map((user) => (
          <ListItem 
            key={user.userId}
            sx={{ 
              py: 1,
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                transform: 'translateX(4px)'
              }
            }}
            onClick={() => handleUserClick(user.username)}
          >
            <ListItemAvatar>
              <Tooltip title={user.bio || 'No bio yet'} arrow placement="top">
                <Avatar
                  src={user.profilePicture || user.avatarUrl || getDefaultAvatar(user.username)}
                  alt={user.displayName || user.username}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    border: user.isHost ? '2px solid' : 'none',
                    borderColor: 'primary.main',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }}
                />
              </Tooltip>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: user.isHost ? 600 : 400 }}>
                    {user.displayName || user.username}
                  </Typography>
                  {user.isHost && (
                    <Tooltip title="Room Host" arrow>
                      <StarIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    </Tooltip>
                  )}
                  {user.currentlyPlaying && (
                    <Tooltip title={`Listening to: ${user.currentlyPlaying}`} arrow>
                      <MusicNoteIcon sx={{ fontSize: 16, color: 'primary.light' }} />
                    </Tooltip>
                  )}
                </Box>
              }
              secondary={user.status || 'Vibing'}
              secondaryTypographyProps={{
                sx: { 
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  fontStyle: 'italic'
                }
              }}
            />
          </ListItem>
        ))}
        {uniqueUsers.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No listeners yet
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default UserList; 