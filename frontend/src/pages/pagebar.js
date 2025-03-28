import * as React from 'react';
import { useState} from 'react';
import {Box, Toolbar, Typography, Button, IconButton} from '@mui/material';
import { AppBar as MuiAppBar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { SearchIconWrapper, StyledInputBase, Search } from './layouts';

// Top bar on each page
export const CustomAppBar = () => {
  const [auth] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MuiAppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
      <Toolbar>
        <Typography variant="h6" noWrap component="div"
          sx={{ flexGrow: 1, fontSize: 40}}>
            ResearchPulse
        </Typography>
        <Search margin={1.5}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>
        {auth && (
          <Box>
            <IconButton color="inherit" size="large" aria-label="account of current user" aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
            >
              <AccountCircleIcon fontSize='large'/>
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
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleClose}>My Account</MenuItem>
              <MenuItem onClick={handleClose}>Log Out</MenuItem>
            </Menu>
          </Box>
        )}
        <Typography>
          <Button color="inherit" sx={{fontSize: 18}}>
            About
          </Button>
        </Typography>
      </Toolbar>
    </MuiAppBar>
  );
};
