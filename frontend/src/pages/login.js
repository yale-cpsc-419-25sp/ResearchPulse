import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
}));

const LogInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

function Login() {
  const [userError, setUserError] = useState(false);
  const [userErrorMessage, setUserErrorMessage] = useState('');
  const [userId, setUserId] = useState('');

  const handleSubmit = () => {
    fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // need to set up cookies for this
      body: JSON.stringify({ person_id: userId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          window.location.href = '/dashboard';
        } else {
          setUserError(true);
          setUserErrorMessage(data.error || 'Login failed');
        }
      })
      .catch(() => {
        setUserError(true);
        setUserErrorMessage('Server error');
      });
  };

  const validateInputs = () => {
    // TODO
    // Send inputs (username and password) to backend for validation
    // If not validated show error message, else authenticate and redirect page

    if (!userId) {
      setUserError(true);
      setUserErrorMessage('Please enter a valid User ID.');
    } else {
      setUserError(false);
      setUserErrorMessage('');
      handleSubmit();
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#023E8A'
      }}>
      <LogInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign in
          </Typography>
          <FormControl>
            <FormLabel htmlFor="user_id">User ID</FormLabel>
            <TextField
              error={userError}
              helperText={userErrorMessage}
              id="user_id"
              type="user_id"
              name="user_id"
              placeholder="Enter your ID"
              autoComplete="user_id"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={userError ? 'error' : 'primary'}
              onChange={(event) => setUserId(event.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={validateInputs}
          >
            Log in
          </Button>
        </Card>
      </LogInContainer>
      </Box>
  );
}

export default Login;