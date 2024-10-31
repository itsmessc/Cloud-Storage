// App.js
import React, { useEffect } from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './containers/Home';
import Signin from './containers/Signin';
import Signup from './containers/Signup';
import PrivateRoute from './components/HOC/privateroute';
import { useSelector, useDispatch } from 'react-redux';
import { isUserLoggedin } from './actions';
import Products from './containers/Products';
import Orders from './containers/Orders';

function App() {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);

  useEffect(() => {
    if (!auth.authenticate) {
      dispatch(isUserLoggedin());
    }
  }, [auth.authenticate, dispatch]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Products/></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Orders/></PrivateRoute>} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  );
}

export default App
