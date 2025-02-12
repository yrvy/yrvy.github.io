import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import ReactPlayer from 'react-player';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';
import Chat from '../components/Chat';
import Queue from '../components/Queue';
import UserList from '../components/UserList';
import SearchBar from '../components/SearchBar';
import Reactions from '../components/Reactions';

const SYNC_THRESHOLD = 2; // seconds of difference before forcing sync
const SYNC_INTERVAL = 5000; // sync every 5 seconds

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user, loading: authLoading } = useAuth();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [users, setUsers] = useState([]);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef(null);
  const [seeking, setSeeking] = useState(false);
  const lastProgressRef = useRef(0);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const joinRoom = async () => {
      if (authLoading) return;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // First check if room is private
        const checkResponse = await fetch(`http://localhost:3002/api/rooms/${roomId}`);
        if (!checkResponse.ok) {
          throw new Error('Failed to fetch room');
        }
        const roomData = await checkResponse.json();
        
        if (roomData.isPrivate && !password) {
          setPasswordDialog(true);
          return;
        }

        const response = await fetch(`http://localhost:3002/api/rooms/${roomId}/join`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password })
        });

        if (response.status === 403) {
          const data = await response.json();
          setError(data.message);
          setPasswordDialog(true);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to join room');
        }

        const joinedRoomData = await response.json();
        if (socket) {
          socket.emit('join_room', { 
            roomId, 
            user: {
              id: user.id,
              username: user.username,
              displayName: user.displayName || user.username,
              profilePicture: user.profilePicture || '',
              bio: user.bio || '',
              isHost: joinedRoomData.creator?._id === user.id
            } 
          });
        }

        setPasswordDialog(false);
        setError('');
      } catch (error) {
        console.error('Error joining room:', error);
        navigate('/');
      }
    };

    joinRoom();

    return () => {
      if (user && socket) {
        socket.emit('leave_room', { roomId, userId: user.id });
        fetch(`http://localhost:3002/api/rooms/${roomId}/leave`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).catch(console.error);
        
        // Clear local state
        setUsers([]);
        setQueue([]);
        setCurrentTrack(null);
      }
    };
  }, [roomId, socket, user, navigate, authLoading, password]);

  useEffect(() => {
    if (socket) {
      socket.emit('sync_request', { roomId });

      socket.on('room_state', (state) => {
        if (state.currentTrack) {
          setCurrentTrack(state.currentTrack);
          setQueue(state.queue || []);
          setPlaying(true);
        }
      });

      socket.on('sync_response', ({ track, seekTime }) => {
        if (!track) return;
        
        setCurrentTrack(track);
        if (playerRef.current && !seeking) {
          const currentTime = playerRef.current.getCurrentTime();
          if (Math.abs(currentTime - seekTime) > SYNC_THRESHOLD) {
            playerRef.current.seekTo(seekTime, 'seconds');
          }
        }
      });

      socket.on('track_update', ({ trackData, timestamp }) => {
        setCurrentTrack({ ...trackData, startTime: timestamp });
        setPlaying(true);
        setProgress(0);
        if (playerRef.current) {
          playerRef.current.seekTo(0, 'seconds');
        }
      });

      socket.on('play_state_update', ({ isPlaying, currentTime }) => {
        setPlaying(isPlaying);
        if (playerRef.current && !seeking) {
          const playerTime = playerRef.current.getCurrentTime();
          if (Math.abs(playerTime - currentTime) > SYNC_THRESHOLD) {
            playerRef.current.seekTo(currentTime, 'seconds');
          }
        }
      });

      socket.on('queue_update', (newTrack) => {
        setQueue(prevQueue => [...prevQueue, newTrack]);
      });

      socket.on('queue_item_removed', (trackId) => {
        setQueue(prevQueue => prevQueue.filter(track => track.videoId !== trackId));
      });

      socket.on('users_update', (updatedUsers) => {
        setUsers(updatedUsers);
      });

      const syncInterval = setInterval(() => {
        if (playerRef.current && !seeking && playing) {
          socket.emit('sync_request', { roomId });
        }
      }, SYNC_INTERVAL);

      return () => {
        socket.off('room_state');
        socket.off('sync_response');
        socket.off('track_update');
        socket.off('play_state_update');
        socket.off('queue_update');
        socket.off('queue_item_removed');
        socket.off('users_update');
        clearInterval(syncInterval);
      };
    }
  }, [socket, roomId]);

  const handleProgress = ({ played, playedSeconds }) => {
    if (!seeking) {
      setProgress(played);
      lastProgressRef.current = playedSeconds;
    }
  };

  const handlePlay = () => {
    if (socket && !seeking) {
      socket.emit('play_state_update', {
        roomId,
        isPlaying: true,
        currentTime: lastProgressRef.current
      });
    }
    setPlaying(true);
  };

  const handlePause = () => {
    if (socket && !seeking) {
      socket.emit('play_state_update', {
        roomId,
        isPlaying: false,
        currentTime: lastProgressRef.current
      });
    }
    setPlaying(false);
  };

  const handleVideoEnd = () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      socket.emit('play_track', {
        roomId,
        trackData: nextTrack,
        timestamp: Date.now()
      });
      socket.emit('remove_from_queue', { roomId, trackId: nextTrack.videoId });
    }
  };

  const handleRemoveFromQueue = (track) => {
    setQueue(prevQueue => prevQueue.filter(t => t.videoId !== track.videoId));
  };

  const handleSeek = () => {
    setSeeking(true);
  };

  const handleSeekEnd = () => {
    setSeeking(false);
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      socket.emit('play_state_update', {
        roomId,
        isPlaying: playing,
        currentTime
      });
    }
  };

  return (
    <>
      <Dialog open={passwordDialog} onClose={() => navigate('/')}>
        <DialogTitle>Private Room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/')}>Cancel</Button>
          <Button onClick={() => {
            setPassword(password);
          }}>Join</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ height: '100%', bgcolor: 'background.paper', p: 2 }}>
              {currentTrack ? (
                <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                  <ReactPlayer
                    ref={playerRef}
                    url={`https://www.youtube.com/watch?v=${currentTrack.videoId}`}
                    width="100%"
                    height="100%"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    playing={playing}
                    controls={true}
                    onProgress={handleProgress}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onEnded={handleVideoEnd}
                    onSeek={handleSeek}
                    onSeekEnd={handleSeekEnd}
                    progressInterval={500}
                  />
                </Box>
              ) : (
                <Typography variant="h6" align="center">
                  No track playing
                </Typography>
              )}
              <SearchBar roomId={roomId} socket={socket} />
              
              <Reactions socket={socket} roomId={roomId} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} sx={{ height: '100%' }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              <Grid item xs={12}>
                <Queue 
                  queue={queue} 
                  socket={socket} 
                  roomId={roomId}
                  onRemove={handleRemoveFromQueue}
                />
              </Grid>
              <Grid item xs={12}>
                <UserList users={users} />
              </Grid>
              <Grid item xs={12}>
                <Chat roomId={roomId} socket={socket} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Room; 