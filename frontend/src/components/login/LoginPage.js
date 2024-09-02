import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/api';
import {
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CContainer,
  CRow,
  CCol,
  CAlert,
} from '@coreui/react';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken(email, password);
      if (token) {
        onLogin(token);
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <CContainer style={{ maxWidth: '500px', marginTop: '100px' }}>
      <CRow>
        <CCol>
          <h2 className="text-center" style={{ color: '#007bff' }}>Login</h2>
          {error && <CAlert color="danger">{error}</CAlert>}
          <CForm onSubmit={handleSubmit}>
            <div className="mb-3">
              <CFormLabel htmlFor="email">Email</CFormLabel>
              <CFormInput
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="password">Password</CFormLabel>
              <CFormInput
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <CButton type="submit" color="primary" style={{ width: '100%' }}>
              Login
            </CButton>
          </CForm>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default LoginPage;
