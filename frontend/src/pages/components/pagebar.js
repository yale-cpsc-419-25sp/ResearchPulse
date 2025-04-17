import * as React from 'react';
import { useState } from 'react';
import { Box, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { AppBar as MuiAppBar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { useNavigate } from 'react-router-dom';

// Top bar on each page
export const CustomAppBar = () => {
  const [auth] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();  // useNavigate hook to programmatically navigate to other routes

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to login page after logout
        navigate('/login');
      } else {
        console.error('Logout failed:', data.message);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleLogoClick = () => {
    // Navigate to dashboard when "ResearchPulse" is clicked
    navigate('/dashboard');
  };

  const handleProfileClick = () => {
    // Navigate to profile page when "Profile" is clicked
    navigate('/profile');
  };

  return (
    <MuiAppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, fontSize: 40, cursor: 'pointer' }}
          onClick={handleLogoClick}  // Handle logo click
        >
          ResearchPulse
        </Typography>
        {auth && (
          <Box>
            <IconButton
              color="inherit"
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
            >
              <AccountCircleIcon fontSize="large" />
            </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfileClick}>Profile</MenuItem> {/* Navigate to /profile */}
              <MenuItem onClick={handleLogout}>Log Out</MenuItem>
            </Menu>
          </Box>
        )}
        <Typography>
          <Button color="inherit" sx={{ fontSize: 18 }}>
            About
          </Button>
        </Typography>
      </Toolbar>
    </MuiAppBar>
  );
};
