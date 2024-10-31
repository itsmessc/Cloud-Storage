import React, { useState, useEffect } from 'react';
import Layout from '../components';
import { Row, Col, Container, Form, Button, ListGroup, Alert } from 'react-bootstrap';
import axios from 'axios';
import './style.css';
import { useSelector } from 'react-redux';

function Home() {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [folders, setFolders] = useState([]);
    const [currentDisplay, setCurrentDisplay] = useState([]); // Track the currently displayed folders and files
    const [folderStack, setFolderStack] = useState([]); // Track navigation history for "Go Back" functionality
    const auth = useSelector(state => state.auth);

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
                const response = await axios.get(`http://localhost:5000/api/user/${selectedUser._id}/folders`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const allFolders = response.data;
                setFolders(allFolders);

                // Display only top-level folders initially
                const initialFolders = allFolders.filter(folder =>
                    !folder.parentFolder || !allFolders.some(f => f._id === folder.parentFolder)
                );
                setCurrentDisplay(initialFolders);
                setFolderStack([]); // Reset stack when loading new user's folders
                
            } catch (err) {
                console.error('Error fetching folders and files:', err);
                setError('An error occurred while fetching folders and files.');
            }
        };

        fetchUserFoldersAndFiles();
    }, [selectedUser]);

    const fetchSuggestions = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:5000/api/auth/search?username=${searchTerm}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSuggestions(response.data);
        } catch (err) {
            console.error('Error fetching suggestions:', err);
            setError('No suggestions found or an error occurred while searching.');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setSelectedUser(null);

        if (!searchTerm) return;

        const token = auth.token;

        try {
            const response = await axios.get(`http://localhost:5000/api/auth/search?username=${searchTerm}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(response.data);
            setSuggestions([]);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('No users found or an error occurred while searching.');
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setSearchTerm(user.username);
        setUsers([]);
        setSuggestions([]);
    };

    const handleFolderClick = (folder) => {
        // Add current view to the stack to allow "Go Back" navigation
        setFolderStack([...folderStack, currentDisplay]);

        // Display contents of the selected folder
        const childFolders = folders.filter(f => f.parentFolder === folder._id);
        setCurrentDisplay([...childFolders, ...folder.files]);
    };

    const handleGoBack = () => {
        if (folderStack.length > 0) {
            // Retrieve the last folder view from the stack
            const previousDisplay = folderStack[folderStack.length - 1];
            setCurrentDisplay(previousDisplay);

            // Remove the last entry in the stack
            setFolderStack(folderStack.slice(0, -1));
        }
    };
    const handleDownload = async (fileId, filename) => {
        const token = localStorage.getItem('token');

        try {
          const res = await axios.get(`http://localhost:5000/api/file/download/${fileId}`, {
            responseType: 'blob',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        } catch (error) {
          console.error('Error downloading file:', error);
        }
      };
    return (
        <div>
            <Layout sidebar>
                <Container>
                    <Row className="mb-4">
                        <Col>
                            <Form onSubmit={handleSearch}>
                                <Form.Group controlId="searchUser">
                                    <Form.Control
                                        type="text"
                                        placeholder="Search for a user by username"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {suggestions.length > 0 && (
                                        <ListGroup className="position-absolute w-100" style={{ zIndex: 10 }}>
                                            {suggestions.map((user) => (
                                                <ListGroup.Item
                                                    key={user._id}
                                                    onClick={() => handleUserSelect(user)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {user.username}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    Search
                                </Button>
                            </Form>
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

                                <ListGroup>
                                    {currentDisplay.map(item => (
                                        <ListGroup.Item
                                            key={item._id}
                                            onDoubleClick={() => item.files ?  handleFolderClick(item):null}
                                            onClick={() => item.files ? null : handleDownload(item._id, item.filename)}
                                            style={{ cursor:'pointer' }}
                                        >
                                            {item.files ? item.name : item.filename}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </Col>
                        </Row>
                    )}
                </Container>
            </Layout>
        </div>
    );
}

export default Home;
