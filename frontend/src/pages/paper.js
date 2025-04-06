import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserData, fetchPaperData, addComment, deleteComment } from '../api'; 
import { Box, Toolbar, Typography, Divider, TextField, Button } from '@mui/material';
import { CustomAppBar } from './components/pagebar';
import { PageDrawer, drawerItems } from './components/pagedrawer';

const PaperDetail = () => {
  const { paperId } = useParams(); 
  const [paper, setPaper] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [message, setMessage] = useState('');
  const [personId, setPersonId] = useState(null);
  const [myName, setMyName] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserData();
        console.log('User data:', data);  // Check if user data is returned
        setPersonId(data.person_id);
        setMyName(data.name);
  
        // Fetch paper data using the paperId
        const paperData = await fetchPaperData(paperId); 
        console.log('Paper data:', paperData);  // Check if paper data is returned
        setPaper(paperData);
        setComments(paperData.comments);
      } catch (error) {
        console.error('Error fetching data:', error);
        window.location.href = '/';  // Redirect if error
      }
    };
  
    loadData();
  }, [paperId]);  // `paperId` will trigger a re-fetch if it changes
  
   

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (personId && commentText) {
      try {
        const newComment = await addComment(personId, paperId, commentText);
        setComments([...comments, newComment]);
        setCommentText('');
        setMessage('Comment added successfully!');
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    } else {
      setMessage('Please fill in the comment text.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (personId) {
      try {
        await deleteComment(personId, paperId, commentId);
        setComments(comments.filter(comment => comment.id !== commentId));
        setMessage('Comment deleted successfully!');
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    }
  };
  console.log('Paper object:', paper);
  console.log('Comments object:', comments);
  // console.log('Paper authors: ', paper.authors);

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <CustomAppBar />
      <PageDrawer drawerItems={drawerItems} myName={myName} />
      <Box component="main" sx={{ p: 3, width: 'calc(100% - 240px)' }}>
        <Toolbar />
        <Typography variant="h4">
          {paper ? paper.paper.title : 'Loading...'}
        </Typography>
        <Divider />
        
        {/* Paper Details */}
        {paper && (
          <div>
  
            <Typography variant="h5" sx={{ mt: 2 }}>
            Authors: {paper.authors.map(author => `${author.first_name} ${author.last_name}`).join(', ')}
            </Typography>
            <Divider sx={{ mt: 2 }} />
            
            {/* Comment Section */}
            <h3>Comments:</h3>
            <ul>
              {comments.length === 0 ? (
                <p>No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <li key={comment.id}>
                    <strong>{comment.first_name} {comment.last_name} </strong>: {comment.comment_text}
                    {/* {comment.person_id === personId && (
                      <Button
                        onClick={() => handleDeleteComment(comment.id)}
                        variant="outlined"
                        color="secondary"
                        sx={{ marginLeft: '10px', borderRadius: '8px', padding: '2px 5px' }}
                      >
                        Delete
                      </Button>
                    )} */}
                  </li>
                ))
              )}
            </ul>

            {/* Add Comment Form */}
            {personId && (
              <form onSubmit={handleAddComment} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <TextField
                  id="commentText"
                  label="Enter Comment"
                  variant="outlined"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  sx={{ mr: 2, width: '70%' }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    height: '56px',
                    width: 'auto',
                  }}
                >
                  Add Comment
                </Button>
              </form>
            )}

            {/* Message */}
            <p>{message}</p>
          </div>
        )}
      </Box>
    </Box>
  );
};

export default PaperDetail;
