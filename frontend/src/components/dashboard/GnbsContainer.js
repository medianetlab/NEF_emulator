import React, { useState, useEffect } from 'react';
import AspectContainer from './AspectContainer';
import { getGnbs } from '../../utils/api';

const GnbsContainer = ({ token }) => {
  const [gnbsData, setGnbsData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      if (!token) {
        console.error('Token is missing');
        return;
      }

      const gnbs = await getGnbs(token);
      console.log('Gnbs data:', gnbs);
      
      // Check if gnbs is an array before setting the state
      if (Array.isArray(gnbs)) {
        setGnbsData(gnbs);
      } else {
        console.error('Invalid gnbs data:', gnbs);
      }
    } catch (error) {
      console.error('Error fetching gnbs data:', error);
    }
  };

  return (
    <div>
      <h2>Gnbs Container</h2>
      {gnbsData.map(gnb => (
        <div key={gnb.id}>
          <h3>{gnb.name}</h3>
          <p>ID: {gnb.id}</p>
          <AspectContainer aspectData={gnb} />
          <div>
            <button>Button 1</button>
            <button>Button 2</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GnbsContainer;




