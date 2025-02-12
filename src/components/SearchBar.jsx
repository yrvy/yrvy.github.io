import { useState } from 'react';
import { Paper, InputBase, IconButton, Box, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const SearchBar = ({ roomId, socket }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const searchYouTube = async (searchQuery) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(
          searchQuery
        )}&type=video&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      return data.items.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url
      }));
    } catch (error) {
      console.error('Error searching YouTube:', error);
      return [];
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    const searchResults = await searchYouTube(query);
    setResults(searchResults);
    setSearching(false);
  };

  const handleAddToQueue = (track) => {
    if (socket && roomId) {
      const trackWithMetadata = {
        ...track,
        addedBy: {
          id: socket.id,
          username: 'Anonymous' // Replace with actual username when auth is implemented
        },
        addedAt: new Date().toISOString()
      };
      
      socket.emit('add_to_queue', {
        roomId,
        track: trackWithMetadata
      });
      
      setResults([]);
      setQuery('');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Paper
        component="form"
        onSubmit={handleSearch}
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', mb: 2 }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search YouTube..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" disabled={searching}>
          <SearchIcon />
        </IconButton>
      </Paper>

      {results.length > 0 && (
        <List>
          {results.map((result) => (
            <ListItem
              key={result.videoId}
              secondaryAction={
                <IconButton edge="end" aria-label="add" onClick={() => handleAddToQueue(result)}>
                  <AddIcon />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar variant="rounded" alt={result.title} src={result.thumbnail} />
              </ListItemAvatar>
              <ListItemText
                primary={result.title}
                primaryTypographyProps={{
                  noWrap: true,
                  sx: { maxWidth: '300px' }
                }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default SearchBar; 