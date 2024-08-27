// In Header Component
import { CHeader, CHeaderBrand } from '@coreui/react';
import { FaUserCircle } from 'react-icons/fa'; // Example using react-icons

const Header = () => {
  return (
    <CHeader className="header">
      <CHeaderBrand href="/">NEF</CHeaderBrand>
      <div className="profile-icon">
        <FaUserCircle />
      </div>
    </CHeader>
  );
};
export default Header;
