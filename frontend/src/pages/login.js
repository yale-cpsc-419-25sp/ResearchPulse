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
import { useNavigate } from 'react-router-dom';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!username || !password) {
      setErrorMessage('Please enter both username and password');
      return;
    }

    fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
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
          console.log('Token:', data.token);  // Check if token is valid
          localStorage.setItem('token', data.token);
          localStorage.setItem('person_id', data.person_id);
          navigate('/dashboard');
        }
      })
      .catch(err => {
        setErrorMessage(err.message);
      });
  };

  // Trigger submit on pressing Enter key if both fields are filled
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && username && password) {
      handleSubmit();
    }
  };

  return (
    <Box sx={{ backgroundColor: '#023E8A' }}>
      <LogInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
            Sign in
          </Typography>
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
          <FormControl>
            <FormLabel htmlFor="username">Username</FormLabel>
            <TextField
              type="text"
              value={username}
              name="username"
              placeholder="Enter your username"
              variant="outlined"
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              type="password"
              value={password}
              name="password"
              placeholder="Enter your password"
              variant="outlined"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </FormControl>
          <Button fullWidth variant="contained" onClick={handleSubmit}>Log in</Button>
        </Card>
      </LogInContainer>
    </Box>
  );
}

export default Login;