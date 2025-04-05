import React, { useState, useEffect } from 'react';
import { followUser, unfollowUser, fetchUserData } from '../api';
import { Box, Toolbar, Typography, Divider, TextField, Button } from '@mui/material';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';

const Following = () => {
  const [userId, setUserId] = useState('');
  const [followedUsers, setFollowedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [personId, setPersonId] = useState(null);
  const [myName, setMyName] = useState(null);

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

  // Follow user handler
  const handleFollowUser = async (event) => {
    event.preventDefault();
  
    if (personId && userId) {
      console.log('Following user:', userId, 'by person:', personId);  // Debugging log
  
      try {
        // Send the follow request
        const response = await followUser(personId, userId);
        console.log('Follow response:', response);  // Debugging log
        setMessage(response.message); // Display the response message
  
        // Fetch updated user data to include the newly followed user
        const data = await fetchUserData(); // Get full user data again
        console.log('Updated user data:', data);  // Debugging log
  
        // Update followed users with the full data of the followed user
        setFollowedUsers(data.following || []);
        setUserId(''); // Clear input after following
      } catch (error) {
        console.error('Error following user:', error);  // Debugging log
        setMessage(`Error: ${error.message}`);
      }
    } else {
      setMessage('Please enter a valid User ID.');
    }
  };  
  

  // Unfollow user handler
  const handleUnfollowUser = async (userId) => {
    if (personId && userId) {
      try {
        await unfollowUser(personId, userId);
        setMessage(`You have unfollowed User ${userId}`);
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
              style={{ display: 'flex', alignItems: 'center', width: '100%' }}
            >
              <TextField
                id="userId"
                label="Enter User ID"
                variant="outlined"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                sx={{
                  mr: 2,
                  width: '70%',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />
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
          <p>{message}</p>

          <h3>Users You Follow:</h3>
          <ul>
            {followedUsers.length === 0 ? (
              <p>You are not following anyone yet.</p>
            ) : (
              followedUsers.map((user) => (
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
              ))
            )}
          </ul>
        </div>
      </Box>
    </Box>
  );
};

export default Following;