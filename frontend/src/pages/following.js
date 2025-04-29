import React, { useState, useEffect } from 'react';
import { searchUserByName, followUser, unfollowUser, fetchUserData } from '../api';
import { Box, Toolbar, Typography, Divider, TextField, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';

const Following = () => {
  const [nameInput, setNameInput] = useState('');
  const [followedUsers, setFollowedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [personId, setPersonId] = useState(null);
  const [myName, setMyName] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Fetch user data and followed users
  const loadData = async () => {
    try {
      const data = await fetchUserData();
      console.log('Fetched data:', data);
      setPersonId(data.person_id);
      setMyName(data.name);
      setFollowedUsers(data.following || []); // Set followed users
    } catch (error) {
      console.error('Error fetching user data:', error);
      window.location.href = '/'; // Redirect if error
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const handleSearchUser = async () => {
    if (!nameInput.trim()) {
      setMessage('Please enter a valid name.');
      return;
    }
    try {
      const results = await searchUserByName(nameInput);
      if (results.length === 0) {
        setMessage('No user found with that name.');
        setSearchResults([]);
      } else {
        setMessage('');
        setSearchResults(results.slice(0, 10)); // Show first 10 matches
      }
      setSelectedUserId(''); // Reset selected user ID after search
    } catch (error) {
      console.error('Error searching user:', error);
      setMessage(`Error: ${error.message}`);
      setSearchResults([]);
    }
  };

  const handleFollowUser = async (event) => {
    event.preventDefault();
    
    if (!selectedUserId) {
      setMessage('Please select a user to follow.');
      return;
    }

    try {
      const response = await followUser(personId, selectedUserId);
      const user = searchResults.find(user => user.person_id === selectedUserId);
      setMessage(`You are now following ${user.first_name} ${user.last_name}`);
      await loadData();
      setNameInput('');
      setSearchResults([]);
      setSelectedUserId('');
    } catch (error) {
      console.error('Error following user:', error);
      setMessage(`Error: ${error.message}`);
    }
  };
  

  // Unfollow user handler
  const handleUnfollowUser = async (userId) => {
    if (personId && userId) {
      try {
        await unfollowUser(personId, userId);
        const user = followedUsers.find(u => u.person_id === userId);
        setMessage(`You have unfollowed ${user.first_name} ${user.last_name}`);
        loadData(); 
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <CustomAppBar />
      <PageDrawer drawerItems={drawerItems} myName={myName} />
      <Box component="main" sx={{ p: 3, width: 'calc(100% - 240px)' }}>
        <Toolbar />
        <Typography variant="h3">Followed Users</Typography>
        <Divider />

        <div>
          <h2>Follow a User</h2>
          {personId && (
            <form
              onSubmit={handleFollowUser}
              style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '16px' }}
            >
              <TextField
                id="nameInput"
                label="Enter Name to Search"
                variant="outlined"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                sx={{
                  mr: 2,
                  width: '70%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={handleSearchUser}
                sx={{
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  height: '56px',
                  marginRight: 2,
                }}
              >
                Search
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  height: '56px',
                }}
              >
                Follow
              </Button>
            </form>
          )}

          {searchResults.length > 0 && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="select-user-label">Select User</InputLabel>
              <Select
                labelId="select-user-label"
                value={selectedUserId}
                label="Select User"
                onChange={(e) => setSelectedUserId(e.target.value)}
                sx={{ borderRadius: '8px' }}
              >
                {searchResults.map((user) => (
                  <MenuItem key={user.person_id} value={user.person_id}>
                    {user.first_name} {user.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Typography variant="body1" sx={{ mb: 2 }}>{message}</Typography>

          <h3>Users You Follow:</h3>
          {followedUsers.length === 0 ? (
            <p>You are not following anyone yet.</p>
          ) : (
            <ul>
              {followedUsers.map((user) => (
                <li key={user.person_id}>
                  {user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : `User ${user.person_id}`}
                  <Button
                    onClick={() => handleUnfollowUser(user.person_id)}
                    variant="outlined"
                    color="secondary"
                    sx={{
                      marginLeft: '10px',
                      borderRadius: '8px',
                      padding: '2px 5px',
                    }}
                  >
                    Unfollow
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Box>
    </Box>
  );
};

export default Following;