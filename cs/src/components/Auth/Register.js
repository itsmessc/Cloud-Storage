// src/components/Auth/Register.js
import React, { useState ,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authconstant } from '../../constants';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(()=>{
    const token=localStorage.getItem('token');
    if (token){
      navigate('/folders');
    }
  },[])
  const handleSubmit =async (e) => {
    e.preventDefault();
    try{
      const res=await axios.post('http://localhost:5000/api/auth/register', {name,username,email,password});
      dispatch({type:authconstant.LOGIN_SUCCESS,payload:res.data});
    navigate('/login');

    }
    catch(error){
      console.error(error);
      }
    
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Name" required onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Username" required onChange={(e) => setUsername(e.target.value)} />
        <input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
