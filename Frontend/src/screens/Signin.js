import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { login, verifyOtp, requestOtp } from "../actions";
import Header from "../components/Header";
import "./Signin.css";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequired, setOtpRequired] = useState(false);
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const userLogin = (e) => {
    e.preventDefault();
    const user = {
      email,
      password,
    };

    dispatch(login(user)).then((response) => {
      if (response?.otpRequired) {
        setOtpRequired(true);
        dispatch(requestOtp(email));
      }
    });
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    dispatch(verifyOtp({ email, otp }));
  };

  if (auth.authenticate) {
    return <Navigate to={"/"} />;
  }

  return (
    <div>
      <Header /> {/* Include Header at the top */}
      <div className="main">
        <form
          className="form2"
          onSubmit={otpRequired ? handleOtpSubmit : userLogin}
        >
          <p className="title">Login</p>
          <p className="message">Access your account by signing in.</p>

          <label>
            <input
              required
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span>Email</span>
          </label>

          {!otpRequired && (
            <label>
              <input
                required
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span>Password</span>
            </label>
          )}

          {otpRequired && (
            <label>
              <input
                required
                type="text"
                className="input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <span>Enter OTP</span>
            </label>
          )}

          <button className="submit" type="submit">
            {otpRequired ? "Verify OTP" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signin;
