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
    institution_name: '',
    orcid_id: '',
    username: '',
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
        body: JSON.stringify(formData),
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

  const handleAuthorSignupRedirect = () => {
    navigate('/authorsignup');  // Redirect to the author signup page
  };

  return (
    <Box sx={{ backgroundColor: '#023E8A' }}>
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
            Sign up
          </Typography>
          {error && <Typography color="error" variant="body2">{error}</Typography>}
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
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="username">Username</FormLabel>
            <TextField
              id="username"
              name="username"
              placeholder="Enter your username"
              variant="outlined"
              fullWidth
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              variant="outlined"
              fullWidth
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </FormControl>
          <Button type="submit" fullWidth variant="contained" onClick={handleSignup}>Sign Up</Button>
          <Button
            fullWidth
            variant="text"
            sx={{ marginTop: '10px' }}
            onClick={handleAuthorSignupRedirect}
          >
            I have an ORCID ID
          </Button>
        </Card>
      </SignUpContainer>
    </Box>
  );
}

export default Signup;
