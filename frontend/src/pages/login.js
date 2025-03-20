import * as React from 'react';
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
  const [userError] = React.useState(false);
  const [userErrorMessage] = React.useState('');

  const handleSubmit = (event) => {
    if (userError) {
      event.preventDefault();
      return;
    }
    const data = new FormData(event.currentTarget);
    console.log({
      user_id: data.get('user_id'),
    });
  };

  const validateInputs = () => {
    const user_id = document.getElementById('user_id');
    let isValid = true;

    if (!user_id.value) {
      userError(true);
      userErrorMessage('Please enter a valid User ID.');
      isValid = false;
    } else {
      userError(false);
      userErrorMessage('');
    }
    return isValid;
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
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
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
          </Box>
        </Card>
      </LogInContainer>
      </Box>
  );
}

export default Login;