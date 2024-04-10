const BASE_URL = 'http://localhost:8888/api/v1'; // Change this to your API base URL

export const getToken = async (username, password) => {
  try {
    const response = await fetch('https://localhost:4443/api/v1/login/access-token', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&scope=&client_id=&client_secret=`
    });
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    throw new Error('Error fetching token:', error);
  }
};


export const getUsers = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/Cells?skip=0&limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Error fetching users:', error);
  }
};

