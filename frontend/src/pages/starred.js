import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook
import { starPaper, unstarPaper, fetchUserData, searchPaperByTitle } from '../api';
import { Box, Toolbar, Typography, Divider, TextField, Select, Button, MenuItem, FormControl, InputLabel } from '@mui/material';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';

const StarredPage = () => {
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [starredPapers, setStarredPapers] = useState([]);
  const [message, setMessage] = useState('');
  const [personId, setPersonId] = useState(null);
  const [myName, setMyName] = useState(null);
  const [nameInput, setNameInput] = useState(''); // State to hold the paper title
  const [searchResults, setSearchResults] = useState([]); // State to hold search results
  const navigate = useNavigate(); // Declare navigate to programmatically navigate to paper detail page

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserData();
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

  const handleSearchStarredPapers = async () => {
    if (!nameInput.trim()) {
      setMessage('Please enter a valid paper title.');
      return;
    }
    console.log('Searching for papers with title:', nameInput);

    try {
      const results = await searchPaperByTitle(nameInput);
      if (results.length === 0) {
        setMessage('No papers found with that title.');
        setSearchResults([]);
      } else {
        setMessage('');
        setSearchResults(results.slice(0, 10)); // Show first 10 matches
      }
    } catch (error) {
      console.error('Error searching papers:', error);
      setMessage(`Error: ${error.message}`);
      setSearchResults([]);
      }
    };
  const handleStarPaper = async (event) => {
    event.preventDefault();
  
    if (selectedPaperId) {
      try {
        const response = await starPaper(personId, selectedPaperId);
        const paperId = searchResults.find((paper) => paper.paper_id === selectedPaperId); // Use selectedPaperId instead of paper search 
        // Check if the response is successful and if the paper is already starred
        if (response.success) {
          setMessage('Paper starred successfully!');
          setStarredPapers((prevPapers) => [
            ...prevPapers,
            { paper_id: paperId, title: response.paper.title },
          ]);
          setSearchResults([]); // Clear search results after starring
          setSelectedPaperId(''); // Clear selected paper ID
          setNameInput(''); // Clear input after starring
        } else {
          // If the paper is already starred, display the message from the backend
          setMessage(response.message || 'Error starring the paper.');
        }
        setSelectedPaperId(''); // Clear input after starring
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
            <form
              onSubmit={handleStarPaper}
              style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              
              <TextField
                id="nameInput"
                label="Enter Paper by Name"
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
                onClick={handleSearchStarredPapers}
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
                type="button"
                variant="outlined"
                color="secondary"
                onClick={handleStarPaper}
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


          {searchResults.length > 0 && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="select-paper-label" sx={{ paddingBlockStart: '20px' }}>
                Select Paper
              </InputLabel>
              <Select
                labelId="select-paper-label"
                value={selectedPaperId}
                label="Select Paper"
                onChange={(e) => setSelectedPaperId(e.target.value)}
                sx={{ borderRadius: '8px', marginTop: '20px' }}
              >
                {searchResults.map((paper) => (
                  <MenuItem key={paper.paper_id} value={paper.paper_id}>
                    {paper.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
