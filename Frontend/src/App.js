// App.js
import React, { useEffect } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import Folder from "./screens/Folders";
import Verify from "./screens/Verify";
import Signin from "./screens/Signin";
import Signup from "./screens/Signup";
import PrivateRoute from "./components/HOC/privateroute";
import { useSelector, useDispatch } from "react-redux";
import { isUserLoggedin } from "./actions";

function App() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (!auth.authenticate) {
      dispatch(isUserLoggedin());
    }
  }, [auth.authenticate, dispatch]);

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            
              <Home />
            
          }
        />
        <Route
          path="/folders"
          element={
            <PrivateRoute>
              <Folder />
            </PrivateRoute>
          }
        />
        <Route
          path="/verify"
          element={
              <Verify />
          }
        />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  );
}

export default App;
