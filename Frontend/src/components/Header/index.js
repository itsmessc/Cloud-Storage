import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Signout } from "../../actions/auth.action";
import logo from "./logo.png";

function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const auth=useSelector(state=>state.auth)
  // Check if a token exists to determine if the user is authenticated
  const isAuthenticated = auth.authenticate;

  const handleSignout = () => {
    dispatch(Signout());
    localStorage.removeItem("token"); // Remove token from local storage
    navigate("/signup"); // Redirect to signup
  };

  return (
    <section id="header">
      <a href="/">
        <img src={logo} className="logo" alt="App Logo" />
      </a>
      <div id="name">
        <h2>VaultSecure</h2>
      </div>
      <div>
        <ul id="navbar">
          {isAuthenticated ? (
            <>
              <li>
                <Link className={location.pathname === "/" ? "active" : ""} to="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className={location.pathname === "/folders" ? "active" : ""} to="/folders">
                  Folders
                </Link>
              </li>
              <li>
                <Link className={location.pathname === "/verify" ? "active" : ""} to="/verify">
                  Verify
                </Link>
              </li>
              <li onClick={handleSignout} style={{ cursor: "pointer" }}>
                <span>Signout</span>
              </li>
            </>
          ) : (
            <>
            <li>
                <Link className={location.pathname === "/" ? "active" : ""} to="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className={location.pathname === "/folders" ? "active" : ""} to="/folders">
                  Folders
                </Link>
              </li>
              <li>
                <Link className={location.pathname === "/verify" ? "active" : ""} to="/verify">
                  Verify
                </Link>
              </li>
              <li>
                <Link className={location.pathname === "/signup" ? "active" : ""} to="/signup">
                  Signup
                </Link>
              </li>
              <li>
                <Link className={location.pathname === "/signin" ? "active" : ""} to="/signin">
                  Signin
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div id="mobile">
        <i id="bar" className="fas fa-outdent"></i>
      </div>
    </section>
  );
}

export default Layout;
