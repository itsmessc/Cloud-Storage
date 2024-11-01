import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Signout } from "../../actions/auth.action";
import logo from "./logo.png";

function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignout = () => {
    dispatch(Signout());
    navigate("/signup");
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
        </ul>
      </div>
      <div id="mobile">
        <i id="bar" className="fas fa-outdent"></i>
      </div>
    </section>
  );
}

export default Layout;
