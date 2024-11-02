import React, { useEffect, useState } from 'react';
import FileUpload from './FileUpload';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Layout from "../components/Layout";
import './Folder.css';

const Folder = () => {
  const auth = useSelector((state) => state.auth);
  const token = auth.token;
  const currentUserId = auth.user.id;
  const [folderId, setFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [folderHistory, setFolderHistory] = useState([null]);
  const [openDropdown, setOpenDropdown] = useState(null); // Track open dropdown
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post(
          `https://cs-begvfwd8a4gvddaf.canadacentral-01.azurewebsites.net/api/folder/find${folderId ? `?id=${folderId}` : ''}`,
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.menu-dropdown') && !e.target.closest('.menu-btn')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCreateFolder = async (folderName) => {
    const name = prompt('Enter folder name:');
    if (!name) return;

    try {
      const res = await axios.post(
        'https://cs-begvfwd8a4gvddaf.canadacentral-01.azurewebsites.net/api/folder/create',
        { name, parentFolder: folderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFolders((prev) => [...prev, { _id: res.data._id, name }]);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) formData.append('folder', folderId);
      const res = await axios.post('https://cs-begvfwd8a4gvddaf.canadacentral-01.azurewebsites.net/api/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setFiles((prev) => [...prev, res.data.file]);
      setUploadModalOpen(false);
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
      await axios.delete(`https://cs-begvfwd8a4gvddaf.canadacentral-01.azurewebsites.net/api/folder/delete/${id}?isFolder=${isFolder}`, {
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
        `https://cs-begvfwd8a4gvddaf.canadacentral-01.azurewebsites.net/api/folder/toggle-visibility/${id}`,
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
      const res = await axios.get(`https://cs-begvfwd8a4gvddaf.canadacentral-01.azurewebsites.net/api/file/download/${fileId}`, {
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
        <h2 className="add-files-title">File Explorer</h2>
        
        <div className="top-controls">
          <button
            className="action-button"
            onClick={handleCreateFolder}
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
          <button
            className="action-button"
            onClick={() => setUploadModalOpen(true)}
          >
            Upload
          </button>
        </div>

        {uploadModalOpen && (
          <div className="upload-modal">
            <div className="upload-modal-content">
              <button className="close-modal" onClick={() => setUploadModalOpen(false)}>×</button>
              <FileUpload onUpload={handleUpload} />
            </div>
          </div>
        )}

        <div className="main-content">
          <div className="list-header">
            <span className="list-header-item name-column">Name</span>
            <span className="list-header-item type-column">Type</span>
            <span className="list-header-item action-column">Actions</span>
          </div>

          <div className="folders-list">
            {folders.map((folder) => (
              <div className="list-item" key={folder._id} style={{ position: 'relative' }} onDoubleClick={() => handleNavigate(folder._id)}>
                <span className="item-name">{folder.name}</span>
                <span className="item-type">Folder</span>
                <div className="item-actions">
                  <button
                    className="menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === folder._id ? null : folder._id);
                    }}
                  >
                    ⋮
                  </button>
                  {openDropdown === folder._id && (
                    <div className="menu-dropdown">
                      {folder.owner === currentUserId && (
                        <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(folder._id, true); }}>Delete</button>
                      )}
                      <button className="visibility-btn" onClick={(e) => { e.stopPropagation(); toggleVisibility(folder._id, true, folder.isPublic); }}>
                        {folder.isPublic ? 'Make Private' : 'Make Public'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="files-list">
            {files.map((file) => (
              <div className="list-item" key={file._id} style={{ position: 'relative' }}>
                <span className="item-name">{file.filename}</span>
                <span className="item-type">File</span>
                <div className="item-actions">
                  <button
                    className="menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === file._id ? null : file._id);
                    }}
                  >
                    ⋮
                  </button>
                  {openDropdown === file._id && (
                    <div className="menu-dropdown">
                      <button className="download-bn" onClick={(e) => { e.stopPropagation(); handleDownload(file._id, file.filename); }}>Download</button>
                      {file.owner === currentUserId && (
                        <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(file._id, false); }}>Delete</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Folder;
