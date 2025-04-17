import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook
import { starPaper, unstarPaper, fetchUserData } from '../api';
import { Box, Toolbar, Typography, Divider, TextField, Button } from '@mui/material';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';

const StarredPage = () => {
  const [paperId, setPaperId] = useState('');
  const [starredPapers, setStarredPapers] = useState([]);
  const [message, setMessage] = useState('');
  const [personId, setPersonId] = useState(null);
  const [myName, setMyName] = useState(null);
  const navigate = useNavigate(); // Declare navigate to programmatically navigate to paper detail page

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserData();
        console.log('Fetched data:', data);
        setPersonId(data.person_id);
        setMyName(data.name);
        setStarredPapers(data.starredPapers);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        window.location.href = '/';
      }
    };

    loadData();
  }, []);

  // Debugging log to check if personId is set
  console.log('Person ID: ', personId);

  const handleStarPaper = async (event) => {
    event.preventDefault();
  
    if (personId && paperId) {
      try {
        const response = await starPaper(personId, paperId);
  
        // Check if the response is successful and if the paper is already starred
        if (response.success) {
          setMessage('Paper starred successfully!');
          setStarredPapers((prevPapers) => [
            ...prevPapers,
            { paper_id: paperId, title: response.paper.title },
          ]);
        } else {
          // If the paper is already starred, display the message from the backend
          setMessage(response.message || 'Error starring the paper.');
        }
        setPaperId(''); // Clear input after starring
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    } else {
      setMessage('Please fill in the Paper ID.');
    }
  };  

  const handleUnstarPaper = async (paperId) => {
    if (personId && paperId) {
      try {
        await unstarPaper(personId, paperId);
        setMessage('Paper unstarred successfully!');
        setStarredPapers((prevPapers) => prevPapers.filter((paper) => paper.paper_id !== paperId));
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
        {/* Adjusting padding and width of main content area */}
        <Toolbar />
        <Typography variant="h3">Starred Papers</Typography>
        <Divider />
        <div>
          <h2>Star a Paper</h2>

          {/* Show loading message if personId is not yet set */}
          {!personId && <p>Loading user data...</p>}

          {/* Form to star a paper */}
          {personId && (
            <form onSubmit={handleStarPaper} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <TextField
                id="paperId"
                label="Enter Paper ID"
                variant="outlined"
                value={paperId}
                onChange={(e) => setPaperId(e.target.value)}
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
                  width: 'auto',
                }}
              >
                Star Paper
              </Button>
            </form>
          )}

          {/* Message area */}
          <p>{message}</p>

          {/* Display the list of starred papers */}
          <h3>Your Starred Papers:</h3>
          <ul>
            {starredPapers.length === 0 ? (
              <p>No papers starred yet.</p>
            ) : (
              starredPapers.map((paper) => (
                <li
                  key={paper.paper_id} // Ensure unique key
                  onClick={() => navigate(`/paper/${paper.paper_id}`)} // Navigate to paper detail page
                  style={{ cursor: 'pointer' }}
                >
                  {paper.title}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigating when clicking "Unstar"
                      handleUnstarPaper(paper.paper_id);
                    }}
                    variant="outlined"
                    color="secondary"
                    sx={{
                      marginLeft: '10px',
                      borderRadius: '8px',
                      padding: '2px 5px',
                    }}
                  >
                    Unstar
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

export default StarredPage;
