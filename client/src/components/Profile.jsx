import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Avatar, Typography, CircularProgress } from '@mui/material';

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/users/${username}`);
        if (!response.ok) {
          throw new Error('User not found');
        }
        const data = await response.json();
        setProfile(data);

        // Check online status
        const statusResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${data.id}/status`);
        if (statusResponse.ok) {
          const { isOnline } = await statusResponse.json();
          setIsOnline(isOnline);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfile();
  }, [username]);

  return (
    <Container>
      {profile ? (
        <Box sx={{ mt: 4 }}>
          <Avatar
            src={profile.profilePicture}
            alt={profile.displayName}
            sx={{ width: 150, height: 150, mb: 2 }}
          />
          <Typography variant="h4">{profile.displayName}</Typography>
          <Typography variant="subtitle1" color="var(--subtext)">@{profile.username}</Typography>
          <Typography
            variant="subtitle2"
            sx={{
              color: isOnline ? 'var(--primary)' : 'var(--subtext)',
              mt: 1
            }}
          >
            {isOnline ? 'Online' : 'Offline'}
          </Typography>
          {/* ... rest of the profile JSX ... */}
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <CircularProgress />
      )}
    </Container>
  );
};

export default Profile; 