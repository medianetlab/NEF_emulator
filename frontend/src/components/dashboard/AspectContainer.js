import React, { useState, useEffect, useRef } from 'react';
import { getUsers, getCells, getPaths, getGnbs } from '../../utils/api';
import './AspectContainer.css'; // Import the CSS file for styling

const AspectContainer = ({ token, aspectName }) => {
  const [aspectData, setAspectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    adjustContainerWidth();
    window.addEventListener('resize', adjustContainerWidth);
    return () => window.removeEventListener('resize', adjustContainerWidth);
  }, []);

  const fetchData = async () => {
    try {
      let data;
      switch (aspectName) {
        case 'Users':
          data = await getUsers(token);
          break;
        case 'Cells':
          data = await getCells(token);
          break;
        case 'Paths':
          data = await getPaths(token);
          break;
        case 'GNBS':
          data = await getGnbs(token);
          break;
        default:
          break;
      }
      setAspectData(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const adjustContainerWidth = () => {
    if (containerRef.current) {
      const boxWidth = document.querySelector('.box').offsetWidth;
      containerRef.current.style.width = `${boxWidth}px`;
    }
  };

  return (
    <div className="aspect-container" ref={containerRef}>
      <div className="topbar">
        <h2 className="aspect-header">{aspectName}</h2>
      </div>
      <ul>
        {aspectData.map((item, index) => (
          <li key={index}>{/* Display item data here */}</li>
        ))}
      </ul>
    </div>
  );
};

export default AspectContainer;

