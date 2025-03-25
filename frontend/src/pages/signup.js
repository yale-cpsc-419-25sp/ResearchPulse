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
    first_name: '',
    last_name: '',
    affiliation: '',
    bio: ''
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = () => {
    fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          navigate('/login');
        } else {
          setError(data.error || 'Sign-up failed');
        }
      })
      .catch(() => setError('Server error, try again later'));
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
            <FormLabel htmlFor="first_name">First Name</FormLabel>
            <TextField
              id="first_name"
              name="first_name"
              placeholder="Enter your first name"
              variant="outlined"
              fullWidth
              required
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="last_name">Last Name</FormLabel>
            <TextField
              id="last_name"
              name="last_name"
              placeholder="Enter your last name"
              variant="outlined"
              fullWidth
              required
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
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
