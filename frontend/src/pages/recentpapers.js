import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper, Button, Toolbar, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';
import { fetchUserData, fetchDiscoverRecentPapers, starPaper, unstarPaper } from '../api';

function RecentPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myName, setMyName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserData();
        setMyName(data.name);
      } catch (err) {
        console.error('Auth error, redirecting...');
        window.location.href = '/';
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const papers = await fetchDiscoverRecentPapers();
      setPapers(papers);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleStarToggle = async (paper) => {
    try {
      const person_id = localStorage.getItem('person_id');
      if (paper.starred) {
        await unstarPaper(person_id, paper.paperId);
        setMessage(`Unstarred paper: "${paper.title}"`);
      } else {
        await starPaper(person_id, paper.paperId);
        setMessage(`Starred paper: "${paper.title}"`);
      }

      setPapers((prev) =>
        prev.map((p) =>
          p.paperId === paper.paperId ? { ...p, starred: !p.starred } : p
        )
      );
    } catch (err) {
      console.error('Error updating star:', err);
      setMessage('Error updating star');
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CustomAppBar />
      <PageDrawer drawerItems={drawerItems} myName={myName} />
      <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
        <Toolbar />
        <Typography variant="h4" gutterBottom>
          Discover New Papers
        </Typography>
        <Typography variant="body1" gutterBottom>
          Discover recent research papers and stay up to date!
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
          <Typography>No papers found. Try refreshing the page.</Typography>
        ) : (
          <Grid container rowSpacing={6} columnSpacing={3}>
            {papers.map((paper) => (
              <Grid item xs={12} sm={4} md={4} key={paper.paperId}>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    {paper.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Authors:</strong> {paper.authors?.map((a) => a.name).join(', ') || 'Unknown'}
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
}

export default RecentPapers;
