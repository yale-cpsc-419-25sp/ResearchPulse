import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserData, fetchPaperData, addComment, deleteComment } from '../api';
import { Box, Toolbar, Typography, Divider, TextField, Button, CircularProgress } from '@mui/material';
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
  const [showAllAuthors, setShowAllAuthors] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserData();
        setPersonId(data.person_id);
        setMyName(data.name);

        // Fetch paper data using the paperId
        const paperData = await fetchPaperData(paperId);
        console.log('Paper Data:', paperData);  // Check the structure of paper data
        setPaper({
          ...paperData.paper,
          authors: paperData.authors,
          starred_by: paperData.starred_by,
        });

        setComments(paperData.comments || []);  // Ensure comments is an empty array if undefined
      } catch (error) {
        console.error('Error fetching data:', error);
        window.location.href = '/';
      }
    };

    loadData();
  }, [paperId]);

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (personId && commentText) {
      try {
        const newComment = await addComment(paperId, personId, commentText);

        // Log the response to see the comment text
        console.log('New Comment:', newComment);

        // Optimistically update the UI with the new comment
        setComments(prevComments => [
          ...prevComments,
          { 
            comment_id: newComment.comment_id,  // Ensure backend returns comment_id
            first_name: newComment.first_name,  // Ensure first_name is available
            last_name: newComment.last_name,    // Ensure last_name is available
            comment_text: newComment.comment_text, // Ensure comment_text is available
            person_id: personId
          }
        ]);

        setCommentText(''); // Clear the input after adding the comment
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
        await deleteComment(paperId, commentId);
        setComments(comments.filter(comment => comment.comment_id !== commentId)); // Remove the comment from the UI
        setMessage('Comment deleted successfully!');
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <CustomAppBar />
      <PageDrawer drawerItems={drawerItems} myName={myName} />
      <Box component="main" sx={{ p: 3, width: 'calc(100% - 240px)' }}>
        <Toolbar />
        <Typography variant="h4">{paper ? paper.title : 'Loading...'}</Typography>
        <Divider />

        {/* Paper Details */}
        {paper && (
          <div>
            <Typography variant="h5" sx={{ mt: 2 }}>
              <strong>Authors: </strong>
              {paper.authors && paper.authors.length > 0 ? (
                <>
                  { (showAllAuthors ? paper.authors : paper.authors.slice(0, 5)).map((author, index) => {
                      const fullName = `${author.first_name} ${author.last_name}`;
                      return (
                        <span key={author.person_id} style={{ marginRight: '0.5rem' }}>
                          {fullName}
                          {index < (showAllAuthors ? paper.authors.length : 5) - 1 && ','}
                        </span>
                      );
                    })
                  }
                  {paper.authors.length > 5 && (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setShowAllAuthors(!showAllAuthors)}
                      sx={{ ml: 1 }}
                    >
                      {showAllAuthors ? 'Show Less' : `+${paper.authors.length - 5} More`}
                    </Button>
                  )}
                </>
              ) : (
                'Unknown'
              )}
            </Typography>

            <Divider sx={{ mt: 2 }} />

            {/* Comment Section */}
            <h3>Comments:</h3>
            <ul>
              {comments.length === 0 ? (
                <p>No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <li key={comment.comment_id}>
                    <strong>{comment.first_name} {comment.last_name}</strong>: {comment.comment_text}
                    {comment.person_id === parseInt(personId) && (
                      <Button
                        variant="text"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteComment(comment.comment_id)}
                        sx={{ ml: 2 }}
                      >
                        Delete
                      </Button>
                    )}
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