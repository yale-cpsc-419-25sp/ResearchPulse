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
    starredPapers: data.starredPapers || []
  };
}
export const get_my_following =  (id) => {
  return fetch('http://127.0.0.1:5000/following', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  }).then(res => res.json());
}
export const get_my_starred_papers =  (id) => {
  return fetch('http://127.0.0.1:5000/starredpapers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  }).then(res => res.json());
}

export const get_person_by_id =  (id) => {
  return fetch('http://127.0.0.1:5000/id/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  }).then(res => res.json());
}