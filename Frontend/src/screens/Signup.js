import React, { useState, useEffect } from 'react';
import Layout from '../components';
import { Container, Row, Col } from 'react-bootstrap';
import Input from '../components/UI/inputs';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { signup } from '../actions';
import axios from 'axios'; // For making API requests
import debounce from 'lodash.debounce'; // To debounce the check

function Signup(props) {
  const auth = useSelector(state => state.auth);
  const [frstname, setfname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [confirmpassword, setconfirmpassword] = useState('');
  const [error, seterror] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null); // New state for username availability
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const userSignup = (e) => {
    e.preventDefault();
    if (frstname === '') {
      alert('Name is required');
      return;
    }
    if (username === '') {
        alert('Username is required');
        return;
    }
    if(username.length < 3){
        alert('Username must be at least 3 characters long');
        return;
    }
    if (email === '') {
        alert('Email is required');
        return;
    }
    if (password === '') {
        alert('Password is required');
        return;
    }
    if (usernameAvailable === false) {
        alert('Username is already taken');
        return;
    }
    const user = {
      name: frstname,
      username: username,
      email,
      password
    };
    dispatch(signup(user));
  };

  // Check username availability (debounced)
  const checkUsernameAvailability = debounce(async (username) => {
    try {
      const response = await axios.post('http://localhost:5000/api/user/check-username', { username });
      setUsernameAvailable(response.data.available);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    }
  }, 300);

  // Trigger username availability check when username changes and is at least 3 characters
  useEffect(() => {
    if (username.length >= 3) {
      checkUsernameAvailability(username);
    } else {
      setUsernameAvailable(null); // Clear availability status if less than 3 characters
    }
  }, [username]);

  if (auth.authenticate) {
    return <Navigate to={'/'} />;
  }

  if (user.loading) {
    return <p>Loading....!</p>;
  }

  return (
    <div>
      <Layout>
        <Container>
          {user.message}
          <Row style={{ marginTop: '50px' }}>
            <Col md={{ span: 6, offset: 3 }}>
              <form onSubmit={userSignup}>
                <Row>
                  <Col md={6}>
                    <Input
                      label="Name"
                      type="text"
                      id="fname"
                      errorMsg=""
                      value={frstname}
                      onChange={(e) => setfname(e.target.value)}
                    />
                  </Col>
                  <Col md={6}>
                    <Input
                      label="Username"
                      type="text"
                      id="lname"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    {username.length >= 3 && (
                      <p className={`text-sm mt-1 ${usernameAvailable === false ? 'text-red-500' : 'text-green-500'}`}>
                        {username.length >= 3 
                          ? usernameAvailable === false 
                            ? "Username already taken" 
                            : "Username is available" 
                          : ""}
                      </p>
                    )}
                  </Col>
                </Row>
                <Input
                  label="Email"
                  type="email"
                  id="emailid"
                  value={email}
                  errorMsg="We'll never share your email with anyone else."
                  onChange={(e) => setemail(e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  id="userpassword"
                  value={password}
                  errorMsg=""
                  onChange={(e) => setpassword(e.target.value)}
                />
                <div className="mb-3 form-check">
                  <input type="checkbox" className="form-check-input" id="exampleCheck1" />
                  <label className="form-check-label" htmlFor="exampleCheck1">Check me out</label>
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
              </form>
            </Col>
          </Row>
        </Container>
      </Layout>
    </div>
  );
}

export default Signup;
