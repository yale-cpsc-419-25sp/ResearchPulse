import * as React from 'react';
import { useState, useEffect } from 'react';
import {Box, Toolbar, Typography, Divider} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { CustomAppBar } from './pagebar';
import { ProfileBox, myFollowingBox, myStarredBox } from './layouts';
import { PageDrawer, drawerItems } from './pagedrawer';

// Main Dashboard Page that displays the user's information

function Dashboard() {

  const [myID, setMyID] = useState(null);
  const [myName, setMyName] = useState(null);
  const [myFollowing, setMyFollowing] = useState([]);
  const [myStarredPapers, setStarredPapers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const person_id = localStorage.getItem('person_id');

    if (!token || !person_id) {
      window.location.href = '/';
      return;
    }  
      
    fetch('http://localhost:5000/dashboard', {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
    .then(async res => {
      if (res.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('person_id');
        window.location.href = '/';
        return;
      }
      const data = await res.json();
      if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch data');
      }
      return data;
    })
    .then(data => {
        setMyID(data.person_id);
        setMyName(data.name);
        setMyFollowing(data.following);
        setStarredPapers(data.starredPapers);
    })
    .catch(error => {
      console.error('Error fetching dashboard data:', error);
      window.location.href = '/';
    });
  }, []);

  //TODO: Make ResearchPulse Heading a Button back to homepage
  return (
    <Box sx={{ display: 'flex' }}>
      <CustomAppBar/>
      <PageDrawer drawerItems={drawerItems} myName={myName}/>
      <Box component="main" sx={{ p: 3 }}>
        <Toolbar />
          <Typography variant="h6">
            Welcome to
          </Typography>
          <Typography variant="h1" marginBlockEnd={3}>
            ResearchPulse
            <Divider sx={{ opacity:0.8}}/>
          </Typography>
        <Typography variant="h6" marginBlockEnd={3}>
          A web platform where researchers can stay up to date with the latest
          research and research discussions through personalized research feeds. 
        </Typography>
        <Divider/>
          <Grid container spacing={3}>
            <Grid size="auto">
              {ProfileBox({height: 20,  width:800, type: 'h5', title: 'My Feed', attributes: [""]})}
            </Grid>
            <Grid item style={{width: "100%"}}>
              {myFollowingBox({height: 400, width: 500, type: 'h5', title: 'My Following', attributes: myFollowing})}
              {ProfileBox({height: 400,  width: 500, type: 'h5', title: 'Papers by My Following', attributes: ['']})}
              {myStarredBox({height: 400,  width: 500, type: 'h5', title: 'Starred Papers', attributes: myStarredPapers})}
              {ProfileBox({height: 400,  width: 500, type: 'h5', title: 'Groups', attributes: ['']})}
            </Grid>
          </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;