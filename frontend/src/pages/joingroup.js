import * as React from 'react';
import { useState, useEffect } from 'react';
import {Box, Toolbar, Divider, Typography, Paper, Grid2} from '@mui/material';
import {TextField, Button } from '@mui/material';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';
import { fetchUserData, joinGroup, leaveMyGroup} from '../api';
import { useNavigate } from 'react-router-dom';


// Main Dashboard Page that displays the user's information

function JoinGroup() {
    const [message, setMessage] = useState('');
    const [personId, setPersonId] = useState(null);
    const [myName, setMyName] = useState(null);
    const [myData, setMyData] = useState({
      groups: [],
    });


    const [groupId, setGroupId] = useState(null);
    const navigate = useNavigate();
        
    useEffect(() => {
        const loadData = async () => {
          try {
            const data = await fetchUserData();
            setPersonId(data.person_id);
            setMyName(data.name);
            setMyData(data.person_dict || {
              groups: [],
            })

            } catch (error) {
            console.error('Error fetching dashboard data:', error);
            window.location.href = '/';
            }
          };
        loadData();
    }, []);

    const joinNewGroup = async (event) => {
        event.preventDefault();
    
        if (personId && groupId) {
          try {
            const groupData = await joinGroup(groupId, personId);
            const data = await fetchUserData();
            setMyData(data.person_dict || {
              groups: [],
            })
            if (!groupData) { 
              setMessage('Group not found.');
              return;
            }
            setMessage('Successfully joined group!');
            setGroupId('');
          } catch (error) {
            setMessage(`Error: ${error.message}`);
          }
        } else {
          setMessage('Please fill in the Group ID.');
        }
    };

    const leaveGroup = async (event) => {
      event.preventDefault();
  
      if (personId && groupId) {
        try {
          const groupData = await leaveMyGroup(groupId, personId);
          const data = await fetchUserData();
          setMyData(data.person_dict || {
            groups: [],
          })
          if (!groupData) { 
            setMessage('Group not found.');
            return;
          }
          setMessage('Successfully left group!');
          setGroupId('');
        } catch (error) {
          setMessage(`Error: ${error.message}`);
        }
      } else {
        setMessage('Please fill in the Group ID.');
      }
  };



    return (
        <Box sx={{ display: 'flex' }}>
          <CustomAppBar />
          <PageDrawer drawerItems={drawerItems} myName={myName} />
          <Box component="main" sx={{ p: 3, width: 'calc(100% - 240px)' }}>
            <Toolbar />
            <Typography variant="h3">
              My Groups
            </Typography>
            <Divider />
            <Typography variant="h6" sx={{ mt: 2 }}>
            Do you want to join discussions with other researchers in your fields?<br/>
            Have a group you want to join? <br/> <br/>
            Enter the group ID below!
            </Typography>
            <br></br>

            {!personId && <p>Loading user data...</p>}

            {personId && (
              <form onSubmit={joinNewGroup} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <TextField
                  id="groupId"
                  label="Enter Group ID"
                  variant="outlined"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  sx={{
                    mr: 2,
                    width: '30%',
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
                    width: 'auto',
                  }}
                >
                Join Group
              </Button>
            </form>
        )}

        {message && (
          <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
            {message}
          </Typography>
        )}
        <br></br>
        <h3>Your Groups ({myData.groups?.length || 0}): </h3>
        <Box sx={{ mb: 4}}>
          <Grid2 container spacing={3}>
          {myData.groups?.map(group => (
            <Grid2 key={group.group_id} xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2, mb: 2, cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5'}, height: '80%', boxShadow: 10, textAlign: 'center'}}
              onClick={() => navigate(`/group/${group.group_id}`)}>
              <Typography>{group.group_name}</Typography>
              <Typography>Group ID: {group.group_id}</Typography>
              <Typography>{group.description}</Typography>
              {/* <br/> */}
              {/* <Typography>Group Members:</Typography>
              <Typography>{group.members}</Typography> */}
          </Paper>
          </Grid2>
          ))}
          </Grid2>
        </Box>
      </Box>
    </Box>
  );
}

export default JoinGroup;