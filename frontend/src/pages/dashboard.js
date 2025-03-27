import * as React from 'react';
import { useState, useEffect } from 'react';
import { styled, alpha } from '@mui/material/styles';
import {Box, Drawer, List, AppBar, Toolbar, Typography, Divider, Button, IconButton} from '@mui/material';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import StarIcon from '@mui/icons-material/Star';
import FeedIcon from '@mui/icons-material/Feed';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupRemoveIcon from '@mui/icons-material/GroupRemove';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import InfoIcon from '@mui/icons-material/Info';
import Grid from '@mui/material/Grid2';
import { get_my_following, get_my_starred_papers, get_my_groups } from '../api';

const drawerSize = 240;
const drawerItems = [
  // TODO add navigation to each item so when you click it goes somwhere
  // Will need to adjust the Drawersection code below to accomodate
  {
    header: 'Dashboard',
    items: [
      {name: 'Profile', icon: <AccountCircleIcon />},
      {name: 'Followed Papers', icon: <FeedIcon />},
      {name: 'Followed Authors', icon: <AssignmentIndIcon />},
      {name: 'Starred', icon: <StarIcon/>},
    ]
  },
  {
    header: 'Discover',
    items: [
      {name: 'Recent Papers', icon: <FeedIcon />},
      {name: 'Recent Authors', icon: <AssignmentIndIcon />},
    ]
  },
  {
    header: 'Messages',
    items: [
      {name: 'Inbox', icon: <MailIcon />},
      {name: 'Join Group', icon: <GroupAddIcon/>},
      {name: 'Leave Group', icon: <GroupRemoveIcon/>},
    ]
  }
];

const Search = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

function DrawerSection(component) {
  return (
    <Box>
      <Divider />
      <Typography variant="h6" align='left' marginBlockStart={2} marginInlineStart={2}>
        {component.header}
      </Typography>
      <List>
        {component.items.map((item) => {
          return(
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary = {item.name} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  );
}

const Boxes = styled(Box)(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height,
  padding: theme.spacing(2),
}));

const myFollowingBox = ({height, width, type, title, attributes}) => (
  <Button sx={{textTransform: 'none'}}>
    <Boxes height={height} width={width}>
      <Typography variant={type} color="black">
        {title}
        {attributes.map((attr) => (
          <Box>
            {attr?.first_name} {attr?.last_name}
          </Box>
        ))}
      </Typography>
    </Boxes>
  </Button>
);
const myStarredBox = ({height, width, type, title, attributes}) => (
  <Button sx={{textTransform: 'none'}}>
    <Boxes height={height} width={width}>
      <Typography variant={type} color="black">
        {title}
        {attributes.map((attr) => (
          <Box>
            {attr?.paper_id}
          </Box>
        ))}
      </Typography>
    </Boxes>
  </Button>
);
const ProfileBox = ({height, width, type, title, attributes}) => (
  <Button sx={{textTransform: 'none'}}>
    <Boxes height={height} width={width}>
      <Typography variant={type} color="black">
        {title}
        {attributes.map((attr) => (
          <Box>
            {Object.keys(attr).map((key, index) => (
              <Typography key={index}>{attr[key]}</Typography>
            ))}
          </Box>
        ))}
      </Typography>
    </Boxes>
  </Button>
);

function Dashboard() {

  const [auth] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [myFollowing, setMyFollowing] = useState([]);
  const [myStarredPapers, setStarredPapers] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      setMyFollowing(await get_my_following('12345'));
      setStarredPapers(await get_my_starred_papers('12345'));
    }
    fetchData();
  }, [])

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // TODO: Make ResearchPulse Heading a Button back to homepage
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
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
      </AppBar>
      <Drawer
        sx={{
          width: drawerSize,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerSize,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        {drawerItems.map((component) => DrawerSection(component))}
        <List>
            <ListItem disablePadding sx={{position: "fixed", bottom: 10, width: drawerSize}}>
              <ListItemButton>
                <ListItemIcon>
                  <InfoIcon/>
                </ListItemIcon>
                <ListItemText primary = "Help"/>
              </ListItemButton>
            </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ p: 3 }}>
        <Toolbar />
          <Typography variant="h6">
            Welcome to
          </Typography>
          <Typography variant="h1" marginBlockEnd={3}>
            ResearchPulse
            <Divider sx={{ opacity:0.8}}/>
          </Typography>
        <Typography variant="h6" marginBlockEnd={3}>
          A web platform where researchers can stay up to date with the latest
          research and research discussions through personalized research feeds. 
        </Typography>
        <Divider/>
          <Grid container spacing={3}>
            <Grid size="auto">
              {ProfileBox({height: 20,  width:800, type: 'h5', title: 'My Feed', attributes: [""]})}
            </Grid>
            <Grid item style={{width: "100%"}}>
              {myFollowingBox({height: 400, width: 500, type: 'h5', title: 'My Following', attributes: myFollowing})}
              {ProfileBox({height: 400,  width: 500, type: 'h5', title: 'Papers by My Following', attributes: ['']})}
              {myStarredBox({height: 400,  width: 500, type: 'h5', title: 'Starred Papers', attributes: myStarredPapers})}
              {ProfileBox({height: 400,  width: 500, type: 'h5', title: 'Groups', attributes: ['']})}
            </Grid>
          </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;