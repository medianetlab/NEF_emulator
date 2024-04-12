const BASE_URL = 'http://localhost:8888/api/v1';

// token for authenticating api calls
export const getToken = async (username, password) => {
  try {
    const response = await fetch(`${BASE_URL}/login/access-token`, { // Concatenate base URL with endpoint
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&scope=&client_id=&client_secret=`
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch token');
    }
    return data.access_token;
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error; // Rethrow the error to propagate it further if needed
  }
};


// get users
export const getUsers = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/users?skip=0&limit=100`, {
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

// get cells
export const getCells = async (token) => {
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
    throw new Error('Error fetching cells:', error);
  }
};


// get notifications
export const getNotifications = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/utils/monitoring/notifications?skip=0&limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Error fetching notifications:', error);
  }
};

// get paths
export const getPaths = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/paths?skip=0&limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Error fetching paths:', error);
  }
};

// get gNBs
export const getGnbs = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/gNBs?skip=0&limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Error fetching paths:', error);
  }
};