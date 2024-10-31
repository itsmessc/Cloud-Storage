// src/components/Auth/Login.js
import React, { useEffect, useState  } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authconstant } from '../../constants';

import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth=useSelector(state=>state.auth);
  useEffect(()=>{
    const token=localStorage.getItem('token');
    if (token){
      navigate('/folders');
    }
  },[])
  const handleSubmit =async (e) => {
    e.preventDefault();
    try{
      dispatch({type:authconstant.LOGIN_REQUEST});
      const res=await axios.post("http://localhost:5000/api/auth/login",{email,password});
      dispatch({type:authconstant.LOGIN_SUCCESS,payload:res.data});
      
    navigate('/folders');
    }
    catch(error){
      console.error(error);
    }
    
  };
  if(auth.authenticate){
    navigate('/folders');
  }
  
  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
