import { useState, useEffect } from 'react';
import { Box, SpeedDial, SpeedDialIcon, SpeedDialAction, Tooltip } from '@mui/material';
import {
  EmojiEmotions as EmojiIcon,
  Favorite as HeartIcon,
  ThumbUp as LikeIcon,
  Star as StarIcon,
  LocalFireDepartment as FireIcon,
  SentimentVeryDissatisfied as SadIcon
} from '@mui/icons-material';

const REACTIONS = [
  { icon: <HeartIcon />, name: '❤️', color: '#ff4081' },
  { icon: <LikeIcon />, name: '👍', color: '#2196f3' },
  { icon: <StarIcon />, name: '⭐', color: '#ffc107' },
  { icon: <FireIcon />, name: '🔥', color: '#ff5722' },
  { icon: <SadIcon />, name: '😢', color: '#9c27b0' },
  { icon: <EmojiIcon />, name: '😊', color: '#4caf50' }
];

const FloatingEmoji = ({ emoji, startPosition }) => {
  const [position, setPosition] = useState(startPosition);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const duration = 3000; // 3 seconds
    const startTime = Date.now();
    const startY = position.y;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        setPosition(prev => ({
          x: prev.x + Math.sin(progress * 4) * 2, // Wavy motion
          y: startY - progress * 200 // Float upward
        }));
        setOpacity(1 - progress);
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <Box
      sx={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        fontSize: '2rem',
        opacity,
        pointerEvents: 'none',
        transition: 'transform 0.2s ease-out',
        transform: `scale(${1 + Math.random() * 0.5})`, // Random size variation
        zIndex: 1000
      }}
    >
      {emoji}
    </Box>
  );
};

const Reactions = ({ socket, roomId }) => {
  const [emojis, setEmojis] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('new_reaction', (reaction) => {
        setEmojis(prev => [...prev, {
          id: Date.now(),
          emoji: reaction.emoji,
          position: reaction.position
        }]);

        // Remove emoji after animation
        setTimeout(() => {
          setEmojis(prev => prev.filter(e => e.id !== reaction.id));
        }, 3000);
      });

      return () => socket.off('new_reaction');
    }
  }, [socket]);

  const handleReaction = (emoji) => {
    if (socket) {
      const position = {
        x: 100 + Math.random() * (window.innerWidth - 200), // Random x position
        y: window.innerHeight - 100 // Start from bottom
      };

      socket.emit('reaction', {
        roomId,
        emoji,
        position
      });

      setEmojis(prev => [...prev, {
        id: Date.now(),
        emoji,
        position
      }]);
    }
    setOpen(false);
  };

  return (
    <>
      {emojis.map(({ id, emoji, position }) => (
        <FloatingEmoji key={id} emoji={emoji} startPosition={position} />
      ))}
      
      <SpeedDial
        ariaLabel="Reactions"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon icon={<EmojiIcon />} />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
      >
        {REACTIONS.map((reaction) => (
          <SpeedDialAction
            key={reaction.name}
            icon={reaction.icon}
            tooltipTitle={reaction.name}
            onClick={() => handleReaction(reaction.name)}
            sx={{
              '& .MuiSpeedDialAction-fab': {
                bgcolor: reaction.color,
                color: 'white',
                '&:hover': {
                  bgcolor: reaction.color,
                  transform: 'scale(1.1)'
                }
              }
            }}
          />
        ))}
      </SpeedDial>
    </>
  );
};

export default Reactions; 