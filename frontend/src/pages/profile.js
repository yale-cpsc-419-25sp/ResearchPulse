import * as React from 'react';
import { useState, useEffect } from 'react';
import {Box, Toolbar, Divider, Typography, Card, CardHeader, CardContent} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';
import { fetchUserData } from '../api';

// Main Dashboard Page that displays the user's information
const FixedCard = styled(Card)(({ theme }) => ({
  border: `2px solid ${theme.palette.divider}`,   // nice light-grey line
  borderRadius: 12,                               // soft corners
  width: 320,                                     // fixed size
  height: 240,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',                               // scroll if list is long
}));
function Profile() {

  const [myID, setMyID] = useState(null);
  const [myName, setMyName] = useState(null);
  const [myData, setMyData] = useState({
    first_name: '',
    last_name: '',
    institution_id: '',
    primary_department: '',
    following: [],
    followers: [],
    authored_papers: [],
    groups: [],
    starred_papers: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserData();
        setMyID(data.person_id);
        setMyName(data.name);
        setMyData(data.person_dict || {
          first_name: '',
          last_name: '',
          institution_id: '',
          primary_department: '',
          following: [],
          followers: [],
          authored_papers: [],
          groups: [],
          starred_papers: []
        });
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
        <Typography variant="h4" sx = {{ mt: 2, mb: 2}}>
          My Profile
        </Typography>
        <Divider/>

        <Grid container spacing={3} sx = {{ mt: 2 }}>
          <Grid item xs={12} md={5}>
            <FixedCard>
              <CardHeader title="Basics" />
              <CardContent sx={{flexGrow: 1}}>
                <Typography>User ID: {myID}</Typography>
                <Typography>
                  Name: {myData.first_name} {myData.last_name}
                </Typography>
                <Typography>Institution ID: {myData.institution_id}</Typography>
                <Typography>Department: {myData.primary_department || '—'}</Typography>
              </CardContent>
            </FixedCard>
          </Grid>

          <Grid item xs={12} md={8}>
            <FixedCard>
              <CardHeader title={`Starred Papers (${myData.starred_papers.length})`} />
              <CardContent sx={{flexGrow: 1}}>
                {myData.starred_papers.map((p) => (
                  <Typography key={p.paper_id} sx={{ mb: 1 }}>
                    {p.title}
                  </Typography>
                ))}
              </CardContent>
            </FixedCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <FixedCard>
              <CardHeader title={`Groups (${myData.groups.length})`} />
              <CardContent sx={{flexGrow: 1}}>
                {myData.groups.map((g) => (
                  <Typography key={g.group_id}>{g.group_name}</Typography>
                ))}
              </CardContent>
            </FixedCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Profile;