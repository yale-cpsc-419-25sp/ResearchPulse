import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Toolbar, CircularProgress, Divider, Typography, Paper, Grid } from '@mui/material';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';
import { fetchUserData } from '../api';
import { Link } from 'react-router-dom';

function Updates() {
  const [myID, setMyID] = useState(null);
  const [myName, setMyName] = useState(null);
  const [groupStarredPapers, setGroupStarredPapers] = useState([]); // State to hold group's starred papers
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserData();
        setMyID(data.person_id);
        setMyName(data.name);

        // Fetch group members' starred papers
        if (data.groups && data.groups.length > 0) {
          const papers = await fetchGroupStarredPapers(data.groups);
          setGroupStarredPapers(papers);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Helper function to fetch starred papers for each group member
  const fetchGroupStarredPapers = async (groups) => {
    let allStarredPapers = [];
    for (const group of groups) {
      for (const member of group.members) {
        try {
          const memberData = await fetchUserData(member.person_id);
          const starredPapers = memberData.starredPapers;
          allStarredPapers = [...allStarredPapers, ...starredPapers.map(paper => ({
            ...paper,
            groupName: group.group_name,
            memberName: memberData.name
          }))];
        } catch (error) {
          console.error(`Error fetching starred papers for member ${member.person_id}:`, error);
        }
      }
    }
    return allStarredPapers;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CustomAppBar />
      <PageDrawer drawerItems={drawerItems} myName={myName} />
      <Box component="main" sx={{ p: 3, width: 'calc(100% - 240px)' }}>
        <Toolbar />
        <Divider />
        <br />
        <Typography variant="h4">
          Updates
        </Typography>
        <br />
        <Divider />
        <br />
        <Typography variant="h6">
          See what your group members are starring!
        </Typography>
        <br />
            {groupStarredPapers.map((paper, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    <Link to={`/paper/${paper.paperId}`} style={{ textDecoration: 'none' }}>
                      {paper.title}
                    </Link>
                  </Typography>
                  <Typography variant="body2">
                    Starred by: {paper.memberName} from {paper.groupName}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          <Typography>No recent starred papers from your group members.</Typography>
      </Box>
    </Box>
  );
}

export default Updates;
