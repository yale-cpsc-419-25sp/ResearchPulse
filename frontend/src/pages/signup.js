import React, { useState } from 'react';
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

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

function Signup() {
  const [formData, setFormData] = useState({
    person_id: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const response = await fetch('http://localhost:5000/signup', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              person_id: formData.person_id,
              password: formData.password
          })
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Signup failed');
      }

      const data = await response.json();
      if (data.success) {
          sessionStorage.setItem('person_id', data.person_id);
          navigate('/login');
      }
  } catch (err) {
      setError(err.message);
  }
  };

  return (
    <Box sx={{ backgroundColor: '#023E8A' }}>
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign up
          </Typography>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <FormControl>
            <FormLabel htmlFor="person_id">User ID</FormLabel>
            <TextField
              id="person_id"
              name="person_id"
              placeholder="Enter your ID"
              variant="outlined"
              fullWidth
              required
              value={formData.person_id}
              onChange={(e) =>
                setFormData({ ...formData, person_id: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                variant="outlined"
                fullWidth
                required
                value={formData.password}
                onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                }
            />
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={handleSignup}
          >
            Sign Up
          </Button>
        </Card>
      </SignUpContainer>
    </Box>
  );
}

export default Signup;
