import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Toolbar, Typography, Divider, Button, CircularProgress, Paper, Avatar } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';
import { fetchUserData, fetchRandomAuthors, followUser, unfollowUser } from '../api';

function RecentAuthors() {
  const [myName, setMyName] = useState('');
  const [personId, setPersonId] = useState('');
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [followedAuthors, setFollowedAuthors] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserData();
        console.log("Fetched authors:", data);
        setMyName(data.name);
        setPersonId(data.person_id);

        const followingIds = data.person_dict.following.map((user) => user.person_id);
        setFollowedAuthors(followingIds);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        window.location.href = '/';
      }
    };
    loadData();
  }, []);

  // Fetch random authors
  useEffect(() => {
    const loadAuthors = async () => {
      try {
        const data = await fetchRandomAuthors();
        setAuthors(data.authors || []);
      } catch (error) {
        console.error('Error fetching authors:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAuthors();
  }, []);

  // Handle follow action
  const handleFollow = async (author) => {
    if (!personId) {
      setMessage('Error: Missing person_id');
      return;
    }

    try {
      if (followedAuthors.includes(author.person_id)) {
        await unfollowUser(personId, author.person_id);
        setMessage(`You have unfollowed author: ${author.first_name} ${author.last_name}`);
        setFollowedAuthors((prev) => prev.filter((id) => id !== author.person_id));
      } else {
        await followUser(personId, author.person_id);
        setMessage(`You are now following author: ${author.first_name} ${author.last_name}`);
        setFollowedAuthors((prev) => [...prev, author.person_id]);
      }
    } catch (error) {
      console.error('Error following author:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CustomAppBar />
      <PageDrawer drawerItems={drawerItems} myName={myName} />
      <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
        <Toolbar />
        <Typography variant="h4" gutterBottom>
          Discover New Authors
        </Typography>
        <Typography variant="body1" gutterBottom>
          Follow new researchers!
        </Typography>
        <Divider sx={{ my: 2 }} />

        {message && (
          <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
            {message}
          </Typography>
        )}

        {loading ? (
          <CircularProgress />
        ) : authors.length === 0 ? (
          <Typography>No authors found. Try refreshing the page.</Typography>
        ) : (
          <Grid container spacing={3}>
            {authors.map((author) => (
              <Grid item xs={12} sm={6} md={4} key={author.person_id} sx={{ display: 'flex' }}>
                <Paper elevation={3} sx={{ p: 4, 
                                          borderRadius: 2, 
                                          display: 'flex', 
                                          flexDirection: 'column', 
                                          alignItems: 'center', 
                                          justifyContent: 'space-between',
                                          '&:hover': {boxShadow: 6,}}}>
                  <Avatar sx={{ width: 64, height: 64, mb: 1 }}>
                    {author.first_name?.charAt(0)}{author.last_name?.charAt(0)}
                  </Avatar>
                  <Typography variant="h6">
                    {author.first_name} {author.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {author.primary_department || 'No department'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {author.institution_id || 'No institution'}
                  </Typography>
                  <Button
                    variant={followedAuthors.includes(author.person_id) ? 'outlined' : 'contained'}
                    color="primary"
                    onClick={() => handleFollow(author)}
                    sx={{ mt: 1, borderRadius: 2 }}
                  >
                    {followedAuthors.includes(author.person_id) ? 'Unfollow' : 'Follow'}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default RecentAuthors;
