import * as React from 'react';
import { Box, Drawer, List, Toolbar, Typography, Divider } from '@mui/material';
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
import {useNavigate } from 'react-router-dom';

// Drawer size constant
const drawerSize = 240;

export const drawerItems = [
  {
    header: 'Dashboard',
    page: '/dashboard',
    items: [
      { name: 'Profile', icon: <AccountCircleIcon />, page: '/profile' },
      { name: 'Followed Papers', icon: <FeedIcon />, page: '/followedpapers' },
      { name: 'Followed Authors', icon: <AssignmentIndIcon />, page: '/following' },
      { name: 'Starred', icon: <StarIcon />, page: '/starred' },
    ]
  },
  {
    header: 'Discover',
    items: [
      { name: 'New Papers', icon: <FeedIcon />, page: '/recentpapers' },
      { name: 'New Authors', icon: <AssignmentIndIcon />, page: '/recentauthors' },
    ]
  },
  {
    header: 'Groups',
    items: [
      { name: 'Updates', icon: <MailIcon />, page: '/updates' },
      { name: 'Join Group', icon: <GroupAddIcon />, page: '/joingroup' },
      { name: 'Leave Group', icon: <GroupRemoveIcon />, page: '/leavegroup' },
    ]
  }
];

// Drawer section component
export function DrawerSection({ header, page, items }) {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box>
      <Divider />
      {/* Make the header clickable and bold */}
      <ListItem disablePadding>
        <ListItemButton onClick={() => handleNavigation(page)}>
          <ListItemText primary={<Typography variant="h6" sx={{ fontWeight: 'bold' }}>{header}</Typography>} />
        </ListItemButton>
      </ListItem>
      <List>
        {items.map((item) => (
          <ListItem key={item.page} disablePadding>
            <ListItemButton onClick={() => handleNavigation(item.page)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

// Main PageDrawer component
export const PageDrawer = ({ drawerItems, myName }) => {
  return (
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
      <Typography variant="h6" sx={{ marginBlockStart: 2, marginInlineStart: 2, marginBlockEnd: 2 }}>
        Welcome, {myName}
      </Typography>
      {drawerItems.map((component) => (
        <DrawerSection key={component.page} {...component} />
      ))}
      <List>
        <ListItem disablePadding sx={{ position: 'fixed', bottom: 10, width: drawerSize }}>
          <ListItemButton>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="Help" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};
