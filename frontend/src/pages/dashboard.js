import * as React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {Box, Toolbar, Typography, Divider} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { CustomAppBar } from './components/pagebar';
import { myFollowingBox, myStarredBox, myGroupBox} from './components/layouts';
import { PageDrawer, drawerItems } from './components/pagedrawer';
import { fetchUserData } from '../api';

// Main Dashboard Page that displays the user's information

function Dashboard() {

  const [myName, setMyName] = useState(null);
  const [myFollowing, setMyFollowing] = useState([]);
  const [myFollowers, setMyFollowers] = useState([]);
  const [myStarredPapers, setStarredPapers] = useState([]);
  const [myGroups, setGroups] = useState([]);


  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserData();
        console.log('Fetched data:', data);  // <-- Add this to debug
        setMyName(data.name);
        setMyFollowing(data.person_dict.following || []);
        setMyFollowers(data.person_dict.followers || []);
        setStarredPapers(data.starredPapers);
        setGroups(data.person_dict.groups || []);
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
              <Link to="/following" style={{ textDecoration: 'none' }}>
                {myFollowingBox({
                  height: 400, 
                  width: 500, 
                  type: 'h5', 
                  title: 'My Following', 
                  attributes: myFollowing, 
                  titleStyle: { fontWeight: 'bold' },
                  page: '/following'
                })}
              </Link> 
              {myFollowingBox({height: 400,  width: 500, type: 'h5', title: 'My Followers', titleStyle: { fontWeight: 'bold' }, attributes: myFollowers})}
              <Link to="/starred" style={{ textDecoration: 'none' }}>
                {myStarredBox({
                  height: 400, 
                  width: 500, 
                  type: 'h5', 
                  title: 'Starred Papers', 
                  attributes: myStarredPapers, 
                  titleStyle: { fontWeight: 'bold' },
                  page: '/starred'
                })}
              </Link> 
              <Link to="/joingroup" style={{ textDecoration: 'none' }}>
                {myGroupBox({
                  height: 400, 
                  width: 500, 
                  type: 'h5', 
                  title: 'Groups', 
                  attributes: myGroups, 
                  titleStyle: { fontWeight: 'bold' },
                  page: '/joingroup'
                })}
              </Link> 
            </Grid>
          </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;