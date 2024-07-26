import axios from 'axios';

const BASE_URL = 'http://localhost:8888/api/v1';

// token for authenticating API calls
export const getToken = async (username, password) => {
  try {
    const response = await fetch(`${BASE_URL}/login/access-token`, {
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

// Get gNBs
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

// Add new gNB
export const addGNB = async (token, gnb) => {
  try {
    const response = await axios.post(`${BASE_URL}/gNBs`, gnb, {
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

// Edit gNB
export const editGNB = async (token, gnb) => {
  try {
    const response = await axios.put(`${BASE_URL}/gNBs/${gnb.gNB_id}`, gnb, {
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

// Delete gNB
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

//========================================== CELLS ===========================================

// Get Cells
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

// Add new Cell
export const addCell = async (token, cell) => {
  try {
    const response = await axios.post(`${BASE_URL}/Cells`, cell, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding Cell:', error);
    throw error;
  }
};

// Edit Cell
export const editCell = async (token, cell) => {
  try {
    const response = await axios.put(`${BASE_URL}/Cells/${cell.id}`, cell, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error editing Cell:', error);
    throw error;
  }
};

// Delete Cell
export const deleteCell = async (token, cellId) => {
  try {
    await axios.delete(`${BASE_URL}/Cells/${cellId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error deleting Cell:', error);
    throw error;
  }
};

//========================================== UES ===========================================

// Get UEs
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

// Add new UE
export const addUE = async (token, ue) => {
  try {
    const response = await axios.post(`${BASE_URL}/UEs`, ue, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding UE:', error);
    throw error;
  }
};

// Edit UE
export const editUE = async (token, ue) => {
  try {
    const response = await axios.put(`${BASE_URL}/UEs/${ue.supi}`, ue, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error editing UE:', error);
    throw error;
  }
};

// Delete UE
export const deleteUE = async (token, ueSupi) => {
  try {
    await axios.delete(`${BASE_URL}/UEs/${ueSupi}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error deleting UE:', error);
    throw error;
  }
};

//========================================== PATHS ===========================================

// Get Paths
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

// Add new Path
export const addPath = async (token, path) => {
  try {
    const response = await axios.post(`${BASE_URL}/paths`, path, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding Path:', error);
    throw error;
  }
};

// Edit Path
export const editPath = async (token, path) => {
  try {
    const response = await axios.put(`${BASE_URL}/paths/${path.id}`, path, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error editing Path:', error);
    throw error;
  }
};

// Delete Path
export const deletePath = async (token, pathId) => {
  try {
    await axios.delete(`${BASE_URL}/paths/${pathId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error deleting Path:', error);
    throw error;
  }
};
