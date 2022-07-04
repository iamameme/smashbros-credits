
export const getLeaderboard = () => {
  return fetch('http://localhost:3009/getAll').then(x => x.json().then(data => {
    console.log(data);
    if (data != null) {
      return data.slice(0,10).sort((a,b) => b.score - a.score);
    }
    return;
  }));
}

export const postToLeaderboard = (name, score) => {
  return fetch('http://localhost:3009/', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({name, score})
  }).then(rawResponse => {
    //const content = await rawResponse.json();
    console.log(rawResponse);
    //return content;
  });
}