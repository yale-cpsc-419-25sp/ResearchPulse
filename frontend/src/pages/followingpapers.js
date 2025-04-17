import React, { useState, useEffect } from 'react';
import { Box, Toolbar, Typography, Divider, Grid, Button, Paper, CircularProgress } from '@mui/material';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';
import { useNavigate } from 'react-router-dom';
import { fetchUserData, get_following_papers } from '../api';

const FollowingPapers = () => {
  const [userId, setUserId] = useState('');
  const [followedUsers, setFollowedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [personId, setPersonId] = useState(null);
  const [myName, setMyName] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user data and followed users
  const loadData = async () => {
    try {
      const data = await fetchUserData();
      setPersonId(data.person_id);
      setMyName(data.name);
      setFollowedUsers(data.following || []); // Set followed users
      const paperResults = await get_following_papers(data.person_id);
      setPapers(paperResults);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data or papers:', error);
      window.location.href = '/';
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Toggle star/unstar
  const handleStarToggle = async (paper) => {
    try {
      const url = paper.starred ? 'http://localhost:5000/unstar_paper' : 'http://localhost:5000/star_paper';
      
      // Send the request to the backend to star or unstar the paper
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          person_id: personId,  // Current logged-in user's person_id
          paper_id: paper.paperId,  // The paper being starred/unstarred
        }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        // Toggle the 'starred' state in the UI based on the paper's current state
        setPapers(prevPapers =>
          prevPapers.map(p =>
            p.paperId === paper.paperId ? { ...p, starred: !p.starred } : p
          )
        );
      } else {
        console.error('Error starring/un-starring paper:', data.error);
      }
    } catch (error) {
      console.error('Error in star/unstar request:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CustomAppBar />
      <PageDrawer drawerItems={drawerItems} myName={myName} />
      <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
        <Toolbar />
        <Typography variant="h4" gutterBottom>
          Papers from people you follow
        </Typography>
        <Typography variant="body1" gutterBottom>
          Stay up-to-date with research from people you're following.
        </Typography>
        <Divider sx={{ my: 2 }} />

        {message && (
          <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
            {message}
          </Typography>
        )}

        {loading ? (
          <CircularProgress />
        ) : papers.length === 0 ? (
          <Typography>No papers found. Try following more researchers!</Typography>
        ) : (
          <Grid container rowSpacing={6} columnSpacing={3}>
            {papers.map((paper) => (
              <Grid item xs={12} sm={4} md={4} key={paper.paperId}>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Button onClick={() => navigate(`/paper/${paper.paperId}`)}>
                    {paper.title}
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Authors: </strong>
                    {paper.authors?.map((a, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: a.isFollowed ? 'yellow' : 'inherit',
                          padding: a.isFollowed ? '0.1rem' : '0',
                          borderRadius: '0.1rem',
                        }}
                      >
                        {a.name}{index < paper.authors.length - 1 ? ', ' : ''}
                      </span>
                    )) || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Journal:</strong> {paper.venue || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Year:</strong> {paper.year || 'N/A'}
                  </Typography>
                  <Button
                    variant={paper.starred ? 'outlined' : 'contained'}
                    color="primary"
                    onClick={() => handleStarToggle(paper)}
                    sx={{ mt: 'auto', borderRadius: 2 }}
                  >
                    {paper.starred ? 'Unstar' : 'Star'}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default FollowingPapers;
