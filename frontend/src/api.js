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