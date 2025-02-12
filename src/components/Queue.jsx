import { Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, IconButton } from '@mui/material';
import { Delete as DeleteIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';

const Queue = ({ queue = [], onPlay, onRemove, socket, roomId }) => {
  const handlePlay = (track) => {
    if (socket && roomId) {
      socket.emit('play_track', {
        roomId,
        trackData: track,
        timestamp: Date.now()
      });
      socket.emit('remove_from_queue', { roomId, trackId: track.videoId });
    }
    onPlay?.(track);
  };

  const handleRemove = (track) => {
    if (socket && roomId) {
      socket.emit('remove_from_queue', { roomId, trackId: track.videoId });
    }
    onRemove?.(track);
  };

  return (
    <Paper sx={{ height: '100%', bgcolor: 'background.paper', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Queue ({queue.length})
      </Typography>
      <List sx={{ overflow: 'auto', maxHeight: 'calc(100% - 48px)' }}>
        {queue.map((track, index) => (
          <ListItem
            key={`${track.videoId}-${index}`}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="play" onClick={() => handlePlay(track)} sx={{ mr: 1 }}>
                  <PlayArrowIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleRemove(track)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemAvatar>
              <Avatar
                variant="rounded"
                alt={track.title}
                src={track.thumbnail}
                sx={{ width: 60, height: 45, mr: 2 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={track.title}
              secondary={`Added by ${track.addedBy?.username || 'Anonymous'}`}
              primaryTypographyProps={{
                noWrap: true,
                sx: { maxWidth: '200px' }
              }}
            />
          </ListItem>
        ))}
        {queue.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            Queue is empty. Add some tracks!
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default Queue; 