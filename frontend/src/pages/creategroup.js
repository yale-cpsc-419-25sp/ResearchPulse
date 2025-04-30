import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Toolbar, Divider } from '@mui/material';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';
import { fetchUserData } from '../api';
import { createGroup } from '../api';

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [myName, setMyName] = useState('');

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const result = await createGroup(groupName, description);
      setMessage(`Successfully created group "${groupName}" (ID: ${result.group_id})`);
      setGroupName('');
      setDescription('');
    } catch (error) {
      console.error(error);
      setMessage(`Error: ${error.message}`);
    }
  };

  // Fetch user's name (optional, for drawer)
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchUserData();
        setMyName(data.name);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    loadUser();
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <CustomAppBar />
      <PageDrawer drawerItems={drawerItems} myName={myName} />
      <Box component="main" sx={{ p: 3, width: 'calc(100% - 240px)' }}>
        <Toolbar />
        <Typography variant="h4">Create New Group</Typography>
        <Divider sx={{ my: 2 }} />
        <form onSubmit={handleCreateGroup}>
          <TextField
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Group Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary">
            Create Group
          </Button>
        </form>
        {message && (
          <Typography sx={{ mt: 2 }} color="success.main">
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CreateGroup;
