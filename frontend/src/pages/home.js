import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';


function Home() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login'); // Redirect to the login page
  };

  <div className='gradient_background'></div>

  return (
    <Box sx={{
        display: 'flex',
        boxShadow: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Full viewport height
        textAlign: 'center',
        borderRadius: 2,
        backgroundColor: '#023E8A',
      }} 
    >
      <Box sx={{
        display: 'flex',
        boxShadow: 8,
        padding: 5,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: '#ffff', // Light gray background
      }} 
    >
      <Typography variant="h1">Welcome to</Typography>
      <Typography variant="h1" sx={{ mb: 2 }}>ResearchPulse</Typography>
      
      <Typography variant="h6" sx={{ mb: 4 }}>
      A Platform where researchers can stay up to date with the
      latest research and research discussions through personalized
      research feeds. 
      </Typography>

      <Box sx={{
        padding: 3,
        display: 'flex',
        backgroundColor: '#CAF0F8', // White background
        borderRadius: 2, // Rounded corners
        boxShadow: 5, // Add shadow
        cursor: 'pointer', // Change cursor on hover
        '&:hover': {
          backgroundColor: '#e0e0e0', // Light gray on hover
        },
      }}
      onClick={handleLoginClick} // Redirect to login on click
      >
        <Typography variant="h6">Click here to log in</Typography>
      </Box>
    </Box>
    </Box>
  );
}

export default Home;