import * as React from 'react';
import { useState, useEffect } from 'react';
import {Box, Toolbar, Divider, Typography} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';
import { fetchUserData } from '../api';

// Main Dashboard Page that displays the user's information

function Updates() {

  const [myID, setMyID] = useState(null);
  const [myName, setMyName] = useState(null);
  const [myData, setMyData] = useState({
    first_name: '',
    last_name: '',
    authored_papers: [],
    groups: [],
    starred_papers: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserData();
        setMyID(data.person_id);
        setMyName(data.name);
        setMyData(data.person_dict || {
          first_name: '',
          last_name: '',

          authored_papers: [],
          groups: [],
          starred_papers: []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        window.location.href = '/';
      }
    };

    loadData();
  }, []);
return (
    <Box sx={{ display: 'flex' }}>
        <CustomAppBar/>
        <PageDrawer drawerItems={drawerItems} myName={myName}/>
        <Box component="main" sx={{ p: 3 }}>
            <Toolbar />
            <Divider/>
            <br/>
            <Typography variant="h4">
                Updates
            </Typography>
            <br/>
            <Divider/>
            <br/>
        </Box>
    </Box>
);

//     return (
//     <Box sx={{ display: 'flex' }}>
//       <CustomAppBar/>
//       <PageDrawer drawerItems={drawerItems} myName={myName}/>
//       <Box component="main" sx={{ p: 3 }}>
//         <Toolbar />
//         <Divider/>
//         <br/>
//         <Typography variant="h4">
//           My Profile
//         </Typography>
//         <br/>
//         <Divider/>
//           <Grid container spacing={1}>
//             <br/>
//             <Grid item style={{width: "100%"}}>
//               User ID: {myID}
//               <Box sx={{ mb: 4 }}>
//                 <Typography>Name: {myData.first_name} {myData.last_name}</Typography>
//                 <Typography>Institution ID: {myData.institution_id}</Typography>
//                 <Typography>Department: {myData.primary_department}</Typography>
//               </Box>

//               <Box sx={{ mb: 4 }}>
//                 <Typography >Starred Papers ({myData.starred_papers?.length || 0})</Typography>
//                 {myData.starred_papers?.map(paper => (
//                   <Box key={paper.paper_id} sx={{ mb: 1 }}>
//                     <Typography >{paper.title}</Typography>
//                   </Box>
//                 ))}
//               </Box>
            
//               <Box sx={{ mb: 4 }}>
//                 <Typography >Groups ({myData.groups?.length || 0})</Typography>
//                 {myData.groups?.map(group => (
//                   <Box key={group.group_id} sx={{ mb: 1 }}>
//                     <Typography>{group.group_name}</Typography>
//                   </Box>
//                 ))}
//               </Box>

//             </Grid>
//           </Grid>
//       </Box>
//     </Box>
//   );
}

export default Updates;