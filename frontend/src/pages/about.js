import * as React from 'react';
import { useState, useEffect } from 'react';
import {Box, Toolbar, Divider, Typography, Stack, Chip, Link} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';
import { fetchUserData } from '../api';

// Main Dashboard Page that displays the user's information

function Profile() {

  const [myName, setMyName] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserData();
        setMyName(data.name);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        window.location.href = '/';
      }
    };
  
    loadData();
  }, []);

    return (
    <Box sx={{ display: 'flex' }}>
      <CustomAppBar/>
      <PageDrawer drawerItems={drawerItems} myName={myName}/>
      <Box component="main" sx={{ p: 3 }}>
        <Toolbar />
        <Divider/>
        <br/>
        <Typography variant="h4">
          About
        </Typography>
        <br/>
        <Divider/>
          <Grid container spacing={1}>
            <br/>
            <Grid item style={{width: "100%"}}>
                <Typography variant="h5" >
              Welcome to ResearchPulse! This is a platform that allows you to track and manage your research activities.
              with others in your community. This was a final project created by a team of students at Yale University for 
              CPSC 419: Full Stack. Team members include Ashley Yen, Tsach Mackey, Jessica Liu, Kai Zhang, and Manaka Ogura. We hope you enjoy using our platform!
                </Typography>
            </Grid>
          </Grid>

            <img
            src="/ResearchPulse_1.svg"
            alt="ResearchPulse logo"
            style={{ width: 200, height: 'auto', padding: 150, display: 'block', margin: '0 auto' }}
            />

            <Typography  paddingBottom={3}>
                Found a bug or have a feature request?&nbsp;
                <Link
                  href="mailto:support@researchpulse.ai"
                  underline="hover"
                  target="_blank"
                  rel="noopener"
                >
                  support@researchpulse.ai
                </Link>
              </Typography>

            <Stack direction="row" spacing={2} >
                <Chip label="Version 1.0.0" />
                <Chip label="Built with React + Flask" />
                <Chip label="Yale University © 2025" />
              </Stack>
      </Box>
    </Box>
  );
}

export default Profile;