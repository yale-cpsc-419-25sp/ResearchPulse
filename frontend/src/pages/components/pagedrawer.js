import * as React from 'react';
import {Box, Drawer, List, Toolbar, Typography, Divider} from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InfoIcon from '@mui/icons-material/Info';
import MailIcon from '@mui/icons-material/Mail';
import StarIcon from '@mui/icons-material/Star';
import FeedIcon from '@mui/icons-material/Feed';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupRemoveIcon from '@mui/icons-material/GroupRemove';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link, useNavigate } from 'react-router-dom';

// Drawer on each side of the page

const drawerSize = 240;

export const drawerItems = [
  // TODO add navigation to each item so when you click it goes somwhere
  // Will need to adjust the Drawersection code below to accomodate
  {
    header: 'Dashboard',
    items: [
      {name: 'Profile', icon: <AccountCircleIcon />, page: '/profile'},
      {name: 'Followed Papers', icon: <FeedIcon />, page: '/followedpapers'},
      {name: 'Followed Authors', icon: <AssignmentIndIcon />, page: '/followedauthors'},
      {name: 'Starred', icon: <StarIcon/>, page: '/starred'},
    ]
  },
  {
    header: 'Discover',
    items: [
      {name: 'Recent Papers', icon: <FeedIcon />, page: '/recentpapers'},
      {name: 'Recent Authors', icon: <AssignmentIndIcon />, page: '/recentauthors'},
    ]
  },
  {
    header: 'Messages',
    items: [
      {name: 'Inbox', icon: <MailIcon />, page: '/inbox'},
      {name: 'Join Group', icon: <GroupAddIcon/>, page: '/joingroup'},
      {name: 'Leave Group', icon: <GroupRemoveIcon/>, page: '/leavegroup'},
    ]
  }
];

export function DrawerSection(component) {

  const navigate = useNavigate();

  const handleNavigation = (path) => {
      navigate(path);
  };

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
                <ListItemButton onClick={() => handleNavigation(item.page)} component={Link} to={item.page}>
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
  
export const PageDrawer = ({drawerItems, myName}) => {

    return (<Drawer
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
        <Typography variant = "h6" sx={{marginBlockStart: 2, marginInlineStart: 2, marginBlockEnd: 2}}>
          Welcome, {myName}
        </Typography>
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
    );
};