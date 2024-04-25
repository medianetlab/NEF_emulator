import React, { useState, useEffect } from 'react';
import AspectContainer from './AspectContainer';
import { getPaths } from '../../utils/api';

const PathsContainer = ({ token }) => {
  const [pathsData, setPathsData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const paths = await getPaths(token);
      setPathsData(paths);
    } catch (error) {
      console.error('Error fetching paths data:', error);
    }
  };

  return (
    <div>
      <h2>Paths Container</h2>
      <AspectContainer aspectData={pathsData} />
    </div>
  );
};

export default PathsContainer;
