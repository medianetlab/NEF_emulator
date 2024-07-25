import axios from 'axios';

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
    throw error; // Rethrow the error
  }
};

//========================================== GNBS ===========================================
// get gnbs
export const getGNBs = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/gNBs?skip=0&limit=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching gNBs:', error);
    throw error;
  }
};

// delete gnbs
export const deleteGNB = async (token, gnb_id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${gnb_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting gNB:', error);
    throw error;
  }
};

// edit gnb
export const editGNB = async (token, gnb_id) => {
  try {
    const response = await axios.put(`${BASE_URL}/${gnb_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting gNB:', error);
    throw error;
  }
};

// add gnb
export const addGNB = async (token, gnb_id) => {
  try {
    const response = await axios.post(`${BASE_URL}/${gnb_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting gNB:', error);
    throw error;
  }
};
//============================================================================================

// get ues
export const getUEs = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/UEs?skip=0&limit=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching gNBs:', error);
    throw error;
  }
};

// get users
export const getUsers = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/users?skip=0&limit=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching gNBs:', error);
    throw error;
  }
};

// get cells
export const getCells = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/Cells?skip=0&limit=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching gNBs:', error);
    throw error;
  }
};

// get paths
export const getPaths = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/paths?skip=0&limit=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching gNBs:', error);
    throw error;
  }
};
