import * as React from 'react';
import { useState } from 'react';
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
  const[userPassword, setUserPassword] = useState('');

  const handleSubmit = () => {
    if (!userId || !userPassword) {
      setUserError(true);
      setUserErrorMessage('Please enter both ID and password');
      return;
    }

    fetch('http://localhost:5000/login', {
      
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
      body: JSON.stringify({
          person_id: userId,
          password: userPassword
      }),
    })
    .then(async res => {
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Login failed');
        }
        return data;
    })
    .then(data => {
        if (data.success) {
            sessionStorage.setItem('person_id', data.person_id);
            window.location.href = '/dashboard';
        }
    })
    .catch(err => {
        setUserError(true);
        setUserErrorMessage(err.message);
    });
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
              type="text"
              value={userId}
              name="user_id"
              placeholder="Enter your ID"
              autoComplete="user_id"
              variant="outlined"
              color={userError ? 'error' : 'primary'}
              onChange={(event) => setUserId(event.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              error={userError}
              helperText={userErrorMessage}
              type="password"
              value={userPassword}
              name="password"
              placeholder="Enter your Password"
              autoComplete="password"
              variant="outlined"
              color={userError ? 'error' : 'primary'}
              onChange={(event) => setUserPassword(event.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={handleSubmit}>Log in
          </Button>
        </Card>
      </LogInContainer>
      </Box>
  );
}

export default Login;