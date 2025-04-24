import { styled, alpha} from '@mui/material/styles';
import { Box, InputBase} from '@mui/material';
import { Button, Typography } from '@mui/material';


// Styles and Boxes in the layout

const myFollowingBox = ({height, width, type, title, titleStyle, attributes}) => (
  <Button sx={{textTransform: 'none', p: 0}}>
    <Boxes height={height} width={width}>
      <Typography variant={type} color="black" style={titleStyle} paddingBlockEnd={2}>
        {title}
      </Typography >

      {attributes.map((attr) => (
        <Typography key={attr?.person_id} variant={type} color="#084da6">
          {attr?.first_name} {attr?.last_name}
        </Typography>
      ))}
    </Boxes>
  </Button>
);

const myStarredBox = ({height, width, type, title, titleStyle, attributes}) => (
  <Button sx={{textTransform: 'none'}}>
    <Boxes height={height} width={width}>
      <Typography variant={type} color="black" style={titleStyle}>
        {title}
        </Typography>
        {attributes.map((attr) => (
          <Typography variant={"h6"} color="#084da6">
            {attr?.title}
          </Typography>
        ))}
    </Boxes>
  </Button>
);
const myGroupBox = ({ height, width, type, title, titleStyle, attributes }) => (
  <Button sx={{textTransform: 'none'}}>
    <Boxes height={height} width={width}>
      <Typography variant={type} color="black" style={titleStyle}>
        {title}
      </Typography>
        {attributes.map((attr) => (
          <Typography variant={type} color="#084da6">
            {attr?.group_name}
          </Typography>
        ))}
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
              <Typography key={index} >{attr[key]} </Typography>
            ))}
          </Box>
        ))}
      </Typography>
    </Boxes>
  </Button>
);

const HeaderBox = ({height, width, type, title, attributes}) => (
    <Boxes height={height} width={width} >
      <Typography variant={type} color="black" >
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
);

const Boxes = styled(Box)(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height,
  padding: theme.spacing(2),
}));

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
  
  export { HeaderBox, ProfileBox, myFollowingBox, myStarredBox, myGroupBox, Boxes, Search, SearchIconWrapper, StyledInputBase };  