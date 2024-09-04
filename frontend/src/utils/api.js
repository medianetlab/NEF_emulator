import axios from 'axios';

const BASE_URL = `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/v1`;

// Get token
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

// scenario
export const importScenario = async (data, token) => {
  try {
    const response = await axios.post(`${BASE_URL}/utils/import/scenario`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing scenario:', error);
    throw error;
  }
};

export const exportScenario = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/utils/export/scenario`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting scenario:', error);
    throw error;
  }
};


// gnbs
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

//-------------------------------------------------------------------------

// Cells
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

export const addCell = async (token, cell) => {
  try {
    const response = await axios.post(`${BASE_URL}/Cells`, cell, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding cell:', error);
    throw error;
  }
};

export const editCell = async (token, cell) => {
  try {
    const response = await axios.put(`${BASE_URL}/Cells/${cell.cell_id}`, cell, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error editing cell:', error);
    throw error;
  }
};

export const deleteCell = async (token, cellId) => {
  try {
    await axios.delete(`${BASE_URL}/Cells/${cellId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error deleting cell:', error);
    throw error;
  }
};

// UEs
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

// Paths
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

export const addPath = async (token, path) => {
  try {
    const response = await axios.post(`${BASE_URL}/paths`, path, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding path:', error);
    throw error;
  }
};

export const readPath = async (token, path_id) => {
  try {
    const response = await axios.get(`${BASE_URL}/paths/${path_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching path detail:', error);
    throw error;
  }
};

export const editPath = async (token, path) => {
  try {
    const response = await axios.put(`${BASE_URL}/paths/${path.id}`, path, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error editing path:', error);
    throw error;
  }
};

export const deletePath = async (token, pathId) => {
  try {
    await axios.delete(`${BASE_URL}/paths/${pathId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error deleting path:', error);
    throw error;
  }
};
