import React, { useEffect, useState } from 'react';
import { state_ues } from '../../utils/api'; // Adjust the path as needed

const UpdateUEPositions = ({ token }) => {
  const [ues, setUEs] = useState([]);

  useEffect(() => {
    const fetchUEs = async () => {
      try {
        const ueState = await state_ues(token);
        setUEs(ueState);
      } catch (error) {
        console.error('Error fetching UE state:', error);
      }
    };

    fetchUEs(); // Fetch immediately
    const interval = setInterval(fetchUEs, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [token]);

  return (
    <div>
      {ues.map(ue => (
        <div key={ue.supi}>
          {ue.name}: {ue.latitude}, {ue.longitude}
        </div>
      ))}
    </div>
  );
};

export default UpdateUEPositions;
