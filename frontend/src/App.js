import React, { useState, useEffect } from 'react';
import {Route, Switch} from 'react-router-dom';
import Dashboard from './components/dashboard/DashboardComponent';
import Map from './components/map/MapComponent';
import Layout from './components/layout/Layout';
import { getToken } from './utils/api';
import './App.css';

const App = () => {
  const [token, setToken] = useState('');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken('admin@my-email.com', 'pass');
        setToken(token);
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };
    fetchToken();
  }, []);

  return (
    <Layout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/map" component={Map} />
        <Route path="/" component={Dashboard} />
      </Switch>
    </Layout>
  );

};

export default App;













