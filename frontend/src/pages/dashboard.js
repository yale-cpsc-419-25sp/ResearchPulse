import * as React from 'react';
import { useState, useEffect } from 'react';
import {Box, Toolbar, Typography, Divider} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { CustomAppBar } from './components/pagebar';
import { ProfileBox, myFollowingBox, myStarredBox } from './components/layouts';
import { PageDrawer, drawerItems } from './components/pagedrawer';
import { fetchUserData } from '../api';

// Main Dashboard Page that displays the user's information

function Dashboard() {

  const [myName, setMyName] = useState(null);
  const [myFollowing, setMyFollowing] = useState([]);
  const [myStarredPapers, setStarredPapers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserData();
        setMyName(data.name);
        setMyFollowing(data.following);
        setStarredPapers(data.starredPapers);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        window.location.href = '/';
      }
    };

    loadData();
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
            <br/>
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