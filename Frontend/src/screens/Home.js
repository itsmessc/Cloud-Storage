import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Row, Col, Container, Form, Alert, Button } from "react-bootstrap";
import axios from "axios";
import "./style.css";
import "./SearchBar.css";
import { useSelector } from "react-redux";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentDisplay, setCurrentDisplay] = useState([]);
  const [folderStack, setFolderStack] = useState([]);
  const [welcomeOpacity, setWelcomeOpacity] = useState(1); // Track opacity
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (searchTerm) {
      const delayDebounceFn = setTimeout(() => {
        fetchSuggestions();
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchUserFoldersAndFiles = async () => {
      const token = auth.token;

      try {
        const response = await axios.get(
          `http://localhost:7878/api/user/${selectedUser._id}/folders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const allFolders = response.data;
        setFolders(allFolders);

        const initialFolders = allFolders.filter(
          (folder) =>
            !folder.parentFolder ||
            !allFolders.some((f) => f._id === folder.parentFolder)
        );
        setCurrentDisplay(initialFolders);
        setFolderStack([]);
      } catch (err) {
        console.error("Error fetching folders and files:", err);
        setError("An error occurred while fetching folders and files.");
      }
    };

    fetchUserFoldersAndFiles();
  }, [selectedUser]);

  // Adjust welcome text opacity based on file display
  useEffect(() => {
    if (currentDisplay.length > 0) {
      setWelcomeOpacity(0.3);
    } else {
      setWelcomeOpacity(1);
    }
  }, [currentDisplay]);

  const fetchSuggestions = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:7878/api/auth/search?username=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuggestions(response.data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setError("No suggestions found or an error occurred while searching.");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setSelectedUser(null);

    if (!searchTerm) return;

    const token = auth.token;

    try {
      const response = await axios.get(
        `http://localhost:7878/api/auth/search?username=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data);
      setSuggestions([]);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("No users found or an error occurred while searching.");
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm(user.username);
    setUsers([]);
    setSuggestions([]);
  };

  const handleFolderClick = (folder) => {
    setFolderStack([...folderStack, currentDisplay]);

    const childFolders = folders.filter((f) => f.parentFolder === folder._id);
    setCurrentDisplay([...childFolders, ...folder.files]);
  };

  const handleGoBack = () => {
    if (folderStack.length > 0) {
      const previousDisplay = folderStack[folderStack.length - 1];
      setCurrentDisplay(previousDisplay);
      setFolderStack(folderStack.slice(0, -1));
    }
  };

  const handleDownload = async (fileId, filename) => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(
        `http://localhost:7878/api/file/download/${fileId}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div>
      <Layout />
      <div
        className="welcome-text"
        style={{ opacity: welcomeOpacity }} // Dynamic opacity
      >
        Welcome to VaultSecure
      </div>
      <Container>
        <Row className="mb-4">
          <Col>
            <Form onSubmit={handleSearch} className="search">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit">Go</button>
            </Form>

            {suggestions.length > 0 && (
              <div className="suggestions-list">
                {suggestions.map((user) => (
                  <div
                    key={user._id}
                    className="suggestions-list-item"
                    onClick={() => handleUserSelect(user)}
                  >
                    {user.username}
                  </div>
                ))}
              </div>
            )}
          </Col>
        </Row>

        {error && (
          <Row>
            <Col>
              <Alert variant="danger">{error}</Alert>
            </Col>
          </Row>
        )}

        {selectedUser && (
          <Row className="mt-4">
            <Col>
              <h5>Folders for {selectedUser.username}:</h5>

              {folderStack.length > 0 && (
                <Button variant="link" onClick={handleGoBack}>
                  Go Back
                </Button>
              )}

              <div className="files-container">
                {currentDisplay.map((item) => (
                  <div className="file-card" key={item._id}>
                    <h6>{item.files ? item.name : item.filename}</h6>
                    
                      <Button
                        className="download-btn"
                        onClick={() =>
                          handleDownload(item._id, item.filename)
                        }
                      >
                        Download
                      </Button>
                    
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

export default Home;
