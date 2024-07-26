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
    throw error;
  }
};

//========================================== GNBS ===========================================

// get gNBs
export const getGNBs = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/gNBs?skip=0&limit=100`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching gNBs:', error);
    throw error;
  }
};

// add new gNBs
export const addGNB = async (token) => {
  try {
    const response = await axios.post(`${BASE_URL}/gNBs`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding gNB:', error);
    throw error;
  }
};

// update gNBs
export const editGNB = async (token, gnb) => {
  try {
    const response = await axios.put(`${BASE_URL}/gNBs/${gnb.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error editing gNB:', error);
    throw error;
  }
};

//delete gNBs
export const deleteGNB = async (token, gnbId) => {
  try {
    await axios.delete(`${BASE_URL}/gNBs/${gnbId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error deleting gNB:', error);
    throw error;
  }
};

// get cells
export const getCells = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/Cells?skip=0&limit=100`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cells:', error);
    throw error;
  }
};

// get ues
export const getUEs = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/UEs?skip=0&limit=100`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching UEs:', error);
    throw error;
  }
};

// get paths
export const getPaths = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/paths?skip=0&limit=100`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching paths:', error);
    throw error;
  }
};
