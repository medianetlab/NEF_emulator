import React, { useState, useEffect } from 'react';
import './RowContainer.css'; // Import the CSS file for styling
import logo1 from '../../assets/UE.png'; // Import local logo images
import logo2 from '../../assets/UE.png';
import logo3 from '../../assets/UE.png';
import logo4 from '../../assets/UE.png';
import { getUsers, getCells, getPaths, getGnbs } from '../../utils/api';

const RowContainer = ({ token }) => {

  const [usersCount, setUsersCount] = useState(0);
  const [cellsCount, setCellsCount] = useState(0);
  const [pathsCount, setPathsCount] = useState(0);
  const [gnbsCount, setGnbsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch data from API using the provided token
  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const usersData = await getUsers(token);
      setUsersCount(usersData.length);

      const cellsData = await getCells(token);
      setCellsCount(cellsData.length);

      const pathsData = await getPaths(token);
      setPathsCount(pathsData.length);

      const gnbsData = await getGnbs(token);
      setGnbsCount(gnbsData.length);

      setLoading(false);
      console.log(gnbsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  return (
    <div className="row-container">
      {/* Box for Users */}
      <div className="box" style={{ backgroundColor: '#ffcccc' }}>
        <img src={logo1} alt="Logo 1" className="logo" />
        <div className="description">Users</div>
        <span className="number">{usersCount}</span>
      </div>
      {/* Box for Cells */}
      <div className="box" style={{ backgroundColor: '#ccffcc' }}>
        <img src={logo2} alt="Logo 2" className="logo" />
        <div className="description">Cells</div>
        <span className="number">{cellsCount}</span>
      </div>
      {/* Box for Paths */}
      <div className="box" style={{ backgroundColor: '#ccccff' }}>
        <img src={logo3} alt="Logo 3" className="logo" />
        <div className="description">Paths</div>
        <span className="number">{pathsCount}</span>
      </div>
      {/* Box for Gnbs */}
      <div className="box" style={{ backgroundColor: '#ffffcc' }}>
        <img src={logo4} alt="Logo 4" className="logo" />
        <div className="description">Gnbs</div>
        <span className="number">{gnbsCount}</span>
      </div>
    </div>
  );
};

export default RowContainer;
