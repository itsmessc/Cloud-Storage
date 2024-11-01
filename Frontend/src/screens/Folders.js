import React, { useEffect, useState } from 'react';
import FileUpload from './FileUpload';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Layout from "../components/Layout";
import './Folder.css'; // Import CSS for custom styles

const Folder = () => {
  const auth = useSelector((state) => state.auth);
  const token = auth.token;
  const currentUserId = auth.user.id;
  const [folderId, setFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [folderHistory, setFolderHistory] = useState([null]);
  const [menuVisible, setMenuVisible] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post(
          `http://localhost:7878/api/folder/find${folderId ? `?id=${folderId}` : ''}`,
          { id: folderId },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFolders(res.data.folders);
        setFiles(res.data.files);
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };
    fetchData();
  }, [folderId, token]);

  const handleCreateFolder = async (folderName) => {
    try {
      const res = await axios.post(
        'http://localhost:7878/api/folder/create',
        { name: folderName, parentFolder: folderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFolders((prev) => [...prev, { _id: res.data._id, name: folderName }]);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) formData.append('folder', folderId);
      const res = await axios.post('http://localhost:7878/api/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setFiles((prev) => [...prev, res.data.file]);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleNavigate = (id) => {
    if (folderId !== null) {
      setFolderHistory((prev) => [...prev, folderId]);
    }
    setFolderId(id);
  };

  const handleGoBack = () => {
    if (folderHistory.length > 1) {
      const previousFolderId = folderHistory[folderHistory.length - 1];
      setFolderId(previousFolderId);
      setFolderHistory((prev) => prev.slice(0, -1));
    } else {
      setFolderId(null);
    }
  };

  const handleDelete = async (id, isFolder) => {
    try {
      await axios.delete(`http://localhost:7878/api/folder/delete/${id}?isFolder=${isFolder}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (isFolder) {
        setFolders((prev) => prev.filter((folder) => folder._id !== id));
      } else {
        setFiles((prev) => prev.filter((file) => file._id !== id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const toggleVisibility = async (id, isFolder, currentStatus) => {
    try {
      const res = await axios.patch(
        `http://localhost:7878/api/folder/toggle-visibility/${id}`,
        { public: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (isFolder) {
        setFolders((prev) => prev.map((folder) => (folder._id === id ? { ...folder, public: res.data.public } : folder)));
      } else {
        setFiles((prev) => prev.map((file) => (file._id === id ? { ...file, public: res.data.public } : file)));
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const res = await axios.get(`http://localhost:7878/api/file/download/${fileId}`, {
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
      <Layout />
      <div className="folder-container">
        {/* File Upload and Buttons Area */}
        <h2 className="add-files-title">Add your files</h2>
        <div className="top-controls">
          <FileUpload onUpload={handleUpload} />
          <div className="button-group">
            <button
              className="action-button"
              onClick={() => {
                const folderName = prompt('Enter folder name:');
                if (folderName) handleCreateFolder(folderName);
              }}
            >
              Create Folder
            </button>
            <button
              className="action-button"
              onClick={handleGoBack}
              disabled={folderHistory.length <= 0}
            >
              Go Back
            </button>
          </div>
        </div>

        {/* Folders and Files Display */}
        <div className="main-content">
          <div className="folders-section">
            <h3 className="section-title">Folders</h3>
            <div className="folders-container">
              {folders.map((folder) => (
                <div className="folder-card" key={folder._id} onDoubleClick={() => handleNavigate(folder._id)}>
                  <div className="folder-name">{folder.name}</div>
                  <button className="menu-btn" onClick={() => setMenuVisible(menuVisible === folder._id ? null : folder._id)}>⋮</button>
                  {menuVisible === folder._id && (
                    <div className="menu-dropdown">
                      {folder.owner === currentUserId && (
                        <button className="delete-btn" onClick={() => handleDelete(folder._id, true)}>Delete</button>
                      )}
                      <button className="visibility-btn" onClick={() => toggleVisibility(folder._id, true, folder.public)}>
                        {folder.isPublic ? 'Make Private' : 'Make Public'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="files-section">
            <h3 className="section-title">Files</h3>
            <div className="files-container">
              {files.map((file) => (
                <div className="file-card" key={file._id}>
                  <div className="file-name">{file.filename}</div>
                  <button className="menu-btn" onClick={() => setMenuVisible(menuVisible === file._id ? null : file._id)}>⋮</button>
                  {menuVisible === file._id && (
                    <div className="menu-dropdown">
                      <button className="download-btn" onClick={() => handleDownload(file._id, file.filename)}>Download</button>
                      {file.owner === currentUserId && (
                        <button className="delete-btn" onClick={() => handleDelete(file._id, false)}>Delete</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Folder;
