// PrivateRoute.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = window.localStorage.getItem('token');
  const auth = token ? true : false;
  const navigate = useNavigate();
  const location = useLocation();

  if (!auth) {
    // Navigate to '/signin' with state containing the current location
    
    return <Navigate to={'/signin'}/>;  // Return null to prevent rendering children
  }

  return children;  // Render children if authenticated
};

export default PrivateRoute;
