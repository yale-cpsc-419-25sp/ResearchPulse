export const fetchUserData = async () => {

  const token = localStorage.getItem('token');
  const person_id = localStorage.getItem('person_id');
  
  if (!token || !person_id) {
    window.location.href = '/';
    return;
  }  
        
  const response = await fetch('http://localhost:5000/dashboard', {
    method: 'GET',
    headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
    },
  });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('person_id');
    window.location.href = '/';
    return;
  }

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch dashboard data');
  }

  return {
    person_id: data.person_id,
    person_dict: data.person_dict,
    name: data.name,
    following: data.following || [],
    followers: data.followers || [],
    starredPapers: data.starredPapers || [],
    groups: data.person_dict.groups || [],
  };
}
export const get_following_papers =  (id) => {
  return fetch('http://localhost:5000/followedpapers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  }).then(res => res.json());
}
export const get_my_following =  (id) => {
  return fetch('http://localhost:5000/following', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  }).then(res => res.json());
}
export const get_my_followers =  (id) => {
  return fetch('http://localhost:5000/followers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  }).then(res => res.json());
}
export const get_my_starred_papers =  (id) => {
  return fetch('http://localhost:5000/starredpapers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  }).then(res => res.json());
}

export const get_person_by_id =  (id) => {
  return fetch('http://localhost:5000/id/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  }).then(res => res.json());
}

export const get_group_by_id = async (id) => {
  const response = await fetch(`http://localhost:5000/group/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

// Star a paper
export const starPaper = async (person_id, paper_id) => {
  const response = await fetch('http://localhost:5000/star_paper', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ person_id, paper_id }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to star paper');
  }

  return await response.json();
};

// Unstar a paper
export const unstarPaper = async (person_id, paper_id) => {
  const response = await fetch('http://localhost:5000/unstar_paper', {
    method: 'POST', // Change DELETE to POST here
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ person_id, paper_id }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to unstar paper');
  }

  return await response.json();
};

// Search for a user by their full name
export const searchUserByName = async (fullName) => {
  const response = await fetch(`http://localhost:5000/search_user?name=${encodeURIComponent(fullName)}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to search user');
  }

  const data = await response.json();
  return data; // Returns an array of user objects: [{ person_id, first_name, last_name }, ...]
};

// Follow a user
export const followUser = async (personId, userId) => {
  console.log('Sending follow request:', { person_id: personId, user_id: userId });  // Debugging log
  
  const response = await fetch('http://localhost:5000/follow', {
    method: 'POST',
    credentials: 'include', // Send cookies for session
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      person_id: personId, // Follower
      user_id: userId,     // Person being followed
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error response:', errorData);  // Debugging log
    throw new Error(errorData.error || 'Failed to follow user');
  }

  const responseData = await response.json();
  console.log('Follow response:', responseData);  // Debugging log
  return responseData;
};



// Unfollow a user
export const unfollowUser = async (personId, userId) => {
  const response = await fetch('http://localhost:5000/unfollow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      person_id: personId, 
      user_id: userId,    
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to unfollow user');
  }

  return await response.json();
};

// Fetch paper data by paper_id
export const fetchPaperData = async (paperId) => {
  console.log('Fetching paper data for paperId:', paperId);  // Debugging log
  const response = await fetch(`http://localhost:5000/paper/${paperId}`);
  const data = await response.json();
  console.log('Fetched paper data:', data);  // Log the data fetched from the API
  
  if (!response.ok) {
    throw new Error('Failed to fetch paper data');
  }

  return data;
};

export const getPaperData = async (paperId) => {
  const response = await fetch(`http://localhost:5000/paper/${paperId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

// In api.js

// Add a comment to a paper
export const addComment = async (paperId, personId, commentText) => {
  try {

    const response = await fetch(`http://localhost:5000/paper/${paperId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        person_id: personId,
        paper_id: paperId,
        comment_text: commentText,  // Ensure the key name is correct
        date: new Date().toISOString(),  // Automatically set the current date
      }),
    });

    const data = await response.json();
    console.log('Response Data:', data);  // Log the response from the backend

    if (!response.ok) {
      // If the response is not successful, throw an error
      throw new Error(data.message || 'Failed to add comment');
    }

    return data;  // Return the response data
  } catch (error) {
    console.error('Error in addComment:', error);  // Log the error
    throw error;  // Re-throw the error for further handling in the frontend
  }
};

// Delete a comment from a paper
export const deleteComment = async (paperId, commentId) => {
  const response = await fetch('http://localhost:5000/delete_comment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paper_id: paperId,    // Send paper_id
      comment_id: commentId, // Send comment_id
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete comment');
  }

  return data;  // Return success or error message
};


// Discovering recent papers 
export const fetchDiscoverRecentPapers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/recent_papers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('Backend error:', data.error || 'Unknown error');
      return [];
    }

    return data.papers;
  } catch (error) {
    console.error('Fetch failed:', error);
    return [];
  }
};


// Getting authors to appear in our following page
export const fetchRandomAuthors = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/new_authors', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('Error fetching random authors:', data.error || 'Unknown error');
      return [];
    }

    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
    return [];
  }
};

// Join a new group
export const joinGroup = async (group_id, person_id) => {
  try {
    const response = await fetch('http://localhost:5000/join_group', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    },
    body: JSON.stringify({ group_id, person_id }),
    });
    
    if (!response.ok) {
    const errorText = await response.text();  // Get the response as text
    console.error('joinGroup failed:', response.status, response.statusText, errorText);
    throw new Error(`HTTP error! Status: ${response.status}, ${errorText}`);
    }
    
    const data = await response.json();
    return data;
    } catch (error) {
    console.error('joinGroup fetch error:', error);
    throw error;  // Re-throw the error so the component knows it failed
    }
};

export const leaveMyGroup = async (group_id, person_id) => {
  try {
    const response = await fetch('http://localhost:5000/leave_group', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    },
    body: JSON.stringify({ group_id, person_id }),
    });
    
    if (!response.ok) {
    const errorText = await response.text();  // Get the response as text
    console.error('leaveGroup failed:', response.status, response.statusText, errorText);
    throw new Error(`HTTP error! Status: ${response.status}, ${errorText}`);
    }
    
    const data = await response.json();
    return data;
    } catch (error) {
    console.error('leaveGroup fetch error:', error);
    throw error;  // Re-throw the error so the component knows it failed
    }
};

export const fetchGroupMembers = async (groupId) => {
  const response = await fetch(`http://localhost:5000/group/${groupId}/members`);
  const data = await response.json();

  if (data.success) {
    return data.members; // Return only the members array
  }

  throw new Error(data.error || 'Failed to fetch group members');
};

export const createGroup = async (group_name, description) => {
  const response = await fetch('http://localhost:5000/create_group', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ group_name, description }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create group');
  }

  return data;
};

export const searchPaperByTitle = async (title) => {
  try {
    const response = await fetch(`/search_paper?title=${encodeURIComponent(title)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching for paper:', error);
    throw error;
  }
};
