import React, { useState, useEffect } from 'react';
import AspectContainer from './AspectContainer';
import { getCells } from '../../utils/api';

const CellsContainer = ({ token }) => {
  const [cellsData, setCellsData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const cells = await getCells(token);
      setCellsData(cells);
    } catch (error) {
      console.error('Error fetching cells data:', error);
    }
  };

  return (
    <div>
      <h2>Cells Container</h2>
      <AspectContainer aspectData={cellsData} />
    </div>
  );
};

export default CellsContainer;
