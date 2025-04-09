import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserData, fetchGroupMembers, get_group_by_id } from '../api';
import { Box, Toolbar, Typography, Divider, List, ListItem, ListItemText, Button, CircularProgress } from '@mui/material';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';

const GroupPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [personId, setPersonId] = useState(null);
  const [myName, setMyName] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await fetchUserData();
        setPersonId(userData.person_id);
        setMyName(userData.name);

        const groupData = await get_group_by_id(groupId);
        setGroup(groupData);

        const membersData = await get_group_by_id(groupId);
        setMembers(membersData.members);
      } catch (error) {
        console.error('Error loading data:', error);
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [groupId]);

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <CustomAppBar />
      <PageDrawer drawerItems={drawerItems} myName={myName} />
      <Box component="main" sx={{ p: 3, width: 'calc(100% - 240px)' }}>
        <Toolbar />
        
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Typography variant="h4">{group.group_name}</Typography>
            <Typography variant="subtitle1" gutterBottom>
              {group.description}
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Typography variant="h5">Group Members</Typography>
            {members.length === 0 ? (
              <Typography>No members in this group</Typography>
            ) : (
              <List>
                {members.map(member => (
                  <ListItem key={member.person_id}>
                    <ListItemText
                      primary={member.name}
                      secondary={member.email}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default GroupPage;
