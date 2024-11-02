import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { requestOtp, validateotp, signup } from "../actions";
import debounce from "lodash.debounce";
import { FaExclamationCircle } from "react-icons/fa"; // Icon for password checklist
import "./Signup.css";
import Header from "../components/Header";
import axios from "axios";

function Signup() {
  const auth = useSelector((state) => state.auth);
  const [step, setStep] = useState(1); // Step 1: Email + OTP, Step 2: Remaining details
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCounter, setResendCounter] = useState(0);

  // For Step 2 (After OTP Verification)
  const [frstname, setfname] = useState("");
  const [lastname, setlname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [showChecklist, setShowChecklist] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (resendDisabled && resendCounter > 0) {
      const timer = setInterval(() => {
        setResendCounter((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (resendCounter === 0) {
      setResendDisabled(false);
    }
  }, [resendDisabled, resendCounter]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();

    try {
      await dispatch(requestOtp(email));
      setOtpSent(true);
      setResendDisabled(true);
      setResendCounter(60);
    } catch (err) {
      console.error("Error requesting OTP:", err);
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true);
    setResendCounter(60);
    try {
      await dispatch(requestOtp(email));
      alert("OTP resent successfully.");
    } catch (err) {
      console.error("Error resending OTP:", err);
      setResendDisabled(false);
      setResendCounter(0);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(validateotp({ email, otp }));
      if (result?.status === 200) {
        setOtpVerified(true);
        setStep(2); // Move to step 2 for remaining details
      } else {
        alert("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (password !== confirmpassword) {
      alert("Passwords do not match");
      return;
    }

    const user = {
      name: `${frstname} ${lastname}`,
      username,
      email,
      password,
    };
    dispatch(signup(user)).then((result) => {
      if (result) {
        alert("Signup successful Please signin to continue");
        navigate("/signin");
      }
    });
  };

  const checkUsernameAvailability = debounce(async (username) => {
    try {
      const response = await axios.post("https://cs-begvfwd8a4gvddaf.canadacentral-01.azurewebsites.net/api/user/check-username", { username });
      setUsernameAvailable(response.data.available);
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameAvailable(null);
    }
  }, 300);

  const checkPasswordStrength = (password) => {
    const minLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setPasswordCriteria({
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    });

    if (minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar) {
      setPasswordStrength("Strong");
    } else if (minLength && hasUppercase && hasLowercase && hasNumber) {
      setPasswordStrength("Moderate");
    } else {
      setPasswordStrength("Weak");
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setPasswordMismatch(value !== password);
  };

  useEffect(() => {
    if (username.length >= 3) {
      checkUsernameAvailability(username);
    } else {
      setUsernameAvailable(null);
    }
  }, [username]);

  if (auth.authenticate) {
    return <Navigate to={"/"} />;
  }

  return (
    <div>
      <Header />
      <div
        className="container-center"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <form
          className="form"
          onSubmit={step === 1 ? handleRequestOtp : handleSignup}
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            maxWidth: "400px",
          }}
        >
          {step === 1 && (
            <>
              <p className="title">Enter Your Email</p>
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

              {otpSent && !otpVerified && (
                <>
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
                  <button
                    type="button"
                    className="resend-otp"
                    onClick={handleResendOtp}
                    disabled={resendDisabled}
                  >
                    {resendDisabled ? `Resend OTP (${resendCounter}s)` : "Resend OTP"}
                  </button>
                  <button onClick={handleVerifyOtp} className="submit">
                    Verify OTP
                  </button>
                </>
              )}

              {!otpSent && (
                <button className="submit" type="submit">
                  Request OTP
                </button>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <p className="title">Complete Your Registration</p>
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
                  {usernameAvailable === false ? "Username already taken" : "Username is available"}
                </p>
              )}

              <label>
                <div style={{ position: "relative" }}>
                  <input
                    required
                    type="password"
                    className="input"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      checkPasswordStrength(e.target.value);
                    }}
                  />
                  <span>Password</span>
                  <FaExclamationCircle
                    style={{
                      color: "red",
                      position: "absolute",
                      right: "-25px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setShowChecklist(true)}
                    onMouseLeave={() => setShowChecklist(false)}
                  />
                </div>
              </label>

              {password && (
                <p
                  className={`password-strength ${
                    passwordStrength === "Strong"
                      ? "text-green-500"
                      : passwordStrength === "Moderate"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  Password strength: {passwordStrength}
                </p>
              )}

              {showChecklist && (
                <div
                  className="password-checklist-tooltip"
                  style={{
                    position: "absolute",
                    right: "20px",
                    top: "100px",
                    width: "250px",
                    border: "1px solid #ddd",
                    padding: "10px",
                    borderRadius: "5px",
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <p>Password must meet the following criteria:</p>
                  <ul>
                    <li className={passwordCriteria.minLength ? "text-green-500" : "text-red-500"}>
                      At least 6 characters
                    </li>
                    <li className={passwordCriteria.hasUppercase ? "text-green-500" : "text-red-500"}>
                      At least one uppercase letter
                    </li>
                    <li className={passwordCriteria.hasLowercase ? "text-green-500" : "text-red-500"}>
                      At least one lowercase letter
                    </li>
                    <li className={passwordCriteria.hasNumber ? "text-green-500" : "text-red-500"}>
                      At least one number
                    </li>
                    <li className={passwordCriteria.hasSpecialChar ? "text-green-500" : "text-red-500"}>
                      At least one special character (e.g., !@#$%^&)
                    </li>
                  </ul>
                </div>
              )}

              <label>
                <div style={{ position: "relative" }}>
                  <input
                    required
                    type="password"
                    className="input"
                    value={confirmpassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  />
                  <span>Confirm Password</span>
                </div>
              </label>

              {passwordMismatch && (
                <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
              )}

              <button className="submit" type="submit">
                Register
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default Signup;
