import * as React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';


function Home() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundColor: '#F9FAFB',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 800,
          textAlign: 'center',
        }}
      >

        <img
          src="/ResearchPulse_1.svg"
          alt="ResearchPulse logo"
          style={{ width: 80, height: 'auto', marginBottom: 20 }}
        />

        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '2.5rem', sm: '3.5rem' },
            mb: 2,
          }}
        >
          Welcome to <br />
          <Box component="span" sx={{ color: '#3B82F6' }}>
            ResearchPulse
          </Box>
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            mb: 5,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          A platform where researchers can stay up to date with the latest research
          and research discussions through personalized research feeds.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              backgroundColor: '#3B82F6',
              '&:hover': { backgroundColor: '#2563EB' },
              textTransform: 'none',
              px: 4,
            }}
          >
            Log In
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/signup')}
            sx={{
              borderColor: '#3B82F6',
              color: '#3B82F6',
              '&:hover': {
                backgroundColor: '#EFF6FF',
                borderColor: '#3B82F6',
              },
              textTransform: 'none',
              px: 4,
            }}
          >
            Sign Up
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default Home;
