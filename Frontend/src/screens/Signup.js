import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Container, Row, Col } from "react-bootstrap";
import Input from "../components/UI/inputs";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { signup } from "../actions";
import axios from "axios"; // For making API requests
import debounce from "lodash.debounce"; // To debounce the check
import Header from "../components/Header";
import "./Signup.css";

function Signup(props) {
  const auth = useSelector((state) => state.auth);
  const [frstname, setfname] = useState("");
  const [lastname, setlname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [confirmpassword, setconfirmpassword] = useState("");
  const [error, seterror] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null); // New state for username availability
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const userSignup = (e) => {
    e.preventDefault();
    if (frstname === "" || lastname === "") {
      alert("Both Firstname and Lastname are required");
      return;
    }
    if (email === "") {
      alert("Email is required");
      return;
    }
    if (password === "") {
      alert("Password is required");
      return;
    }
    if (password !== confirmpassword) {
      alert("Passwords do not match");
      return;
    }
    if (usernameAvailable === false) {
      alert("Username is already taken");
      return;
    }
    const user = {
      name: `${frstname} ${lastname}`,
      username: username,
      email,
      password,
    };
    dispatch(signup(user));
  };

  // Check username availability (debounced)
  const checkUsernameAvailability = debounce(async (username) => {
    try {
      const response = await axios.post(
        "http://localhost:7878/api/user/check-username",
        { username }
      );
      setUsernameAvailable(response.data.available);
    } catch (error) {
      console.error("Error checking username:", error);
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
    return <Navigate to={"/"} />;
  }

  if (user.loading) {
    return <p>Loading....!</p>;
  }

  return (
    <div>
      <Header />
      <div className="main">
        <form className="form" onSubmit={userSignup}>
          <p className="title">Register </p>
          <p className="message">Signup now and get full access to our app. </p>

          <div className="flex">
            <label>
              <input
                required
                type="text"
                className="input"
                value={frstname}
                onChange={(e) => setfname(e.target.value)}
              />
              <span>Firstname</span>
            </label>

            <label>
              <input
                required
                type="text"
                className="input"
                value={lastname}
                onChange={(e) => setlname(e.target.value)}
              />
              <span>Lastname</span>
            </label>
          </div>

          <label>
            <input
              required
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <span>Username</span>
          </label>
          {username.length >= 3 && (
            <p
              className={`text-sm mt-1 ${
                usernameAvailable === false ? "text-red-500" : "text-green-500"
              }`}
            >
              {usernameAvailable === false
                ? "Username already taken"
                : "Username is available"}
            </p>
          )}

          <label>
            <input
              required
              type="email"
              className="input"
              value={email}
              onChange={(e) => setemail(e.target.value)}
            />
            <span>Email</span>
          </label>

          <label>
            <input
              required
              type="password"
              className="input"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
            />
            <span>Password</span>
          </label>

          <label>
            <input
              required
              type="password"
              className="input"
              value={confirmpassword}
              onChange={(e) => setconfirmpassword(e.target.value)}
            />
            <span>Confirm Password</span>
          </label>

          <button className="submit" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
