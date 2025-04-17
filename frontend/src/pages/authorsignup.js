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

const AuthorSignupContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

function AuthorSignup() {
  const [formData, setFormData] = useState({
    orcid_id: '',
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuthorSignup = async () => {
    try {
      // Check if the ORCID ID exists
      const checkResponse = await fetch('http://localhost:5000/check-orcid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orcid_id: formData.orcid_id }),
      });

      if (!checkResponse.ok) {
        const errorData = await checkResponse.json();
        throw new Error(errorData.error || 'Author not found');
      }

      // Proceed with signup for the author
      const response = await fetch('http://localhost:5000/signup-author', {
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
        navigate('/login'); // Redirect to login page after successful signup
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#023E8A' }}>
      <AuthorSignupContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
            Author Signup
          </Typography>
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <FormControl>
            <FormLabel htmlFor="orcid_id">ORCID ID</FormLabel>
            <TextField
              id="orcid_id"
              name="orcid_id"
              placeholder="Enter your ORCID ID"
              variant="outlined"
              fullWidth
              required
              value={formData.orcid_id}
              onChange={(e) => setFormData({ ...formData, orcid_id: e.target.value })}
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
          <Button type="submit" fullWidth variant="contained" onClick={handleAuthorSignup}>Sign Up</Button>
        </Card>
      </AuthorSignupContainer>
    </Box>
  );
}

export default AuthorSignup;
