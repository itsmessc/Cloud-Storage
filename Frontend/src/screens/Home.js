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
          `https://cs-begvfwd8a4gvddaf.canadacentral-01.azurewebsites.net/api/user/${selectedUser._id}/folders`,
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

  const fetchSuggestions = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `https://cs-begvfwd8a4gvddaf.canadacentral-01.azurewebsites.net/api/auth/search?username=${searchTerm}`,
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
        `https://cs-begvfwd8a4gvddaf.canadacentral-01.azurewebsites.net/api/auth/search?username=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      handleUserSelect(response.data[0]);
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
        `https://cs-begvfwd8a4gvddaf.canadacentral-01.azurewebsites.net/api/file/download/${fileId}`,
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
      {!selectedUser && currentDisplay.length === 0 && (
        <div className="welcome-text">
          Welcome to VaultSecure
        </div>
      )}
      <Container>
        <Row className="mb-4">
          <Col>
            <div className="search-container">
              <Form onSubmit={handleSearch} className="search">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">Go</button>
              </Form>
            </div>

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

              <div className="files-list">
                <div className="list-header">
                  <span className="list-header-item name-column">Name</span>
                  <span className="list-header-item type-column">Type</span>
                  <span className="list-header-item action-column">Actions</span>
                </div>

                {currentDisplay.length > 0 ? (
                  currentDisplay.map((item) => (
                    <div className="list-item" key={item._id}>
                      <span
                        className="item-name"
                        onClick={() =>
                          item.files
                            ? handleFolderClick(item)
                            : handleDownload(item._id, item.filename)
                        }
                      >
                        {item.name || item.filename}
                      </span>
                      <span className="item-type">
                        {item.files ? "Folder" : "File"}
                      </span>
                      <div className="item-actions">
                        {!item.files && (
                          <Button
                            className="download-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(item._id, item.filename);
                            }}
                          >
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-folder">
                    <h6>No files in folder</h6>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

export default Home;
