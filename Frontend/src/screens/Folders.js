import React, { useEffect, useState } from 'react';
import FileUpload from './FileUpload';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Layout from '../components';

const Folder = () => {
  const auth = useSelector((state) => state.auth);
  const token = auth.token;
  const currentUserId = auth.user.id;
  const [folderId, setfolderid] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [folderHistory, setFolderHistory] = useState([null]);
  const [menuVisible, setMenuVisible] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post(
          `http://localhost:5000/api/folder/find${folderId ? `?id=${folderId}` : ''}`,
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
        'http://localhost:5000/api/folder/create',
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
      const res = await axios.post('http://localhost:5000/api/file/upload', formData, {
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
    setfolderid(id);
  };

  const handleGoBack = () => {
    if (folderHistory.length > 1) {
      const previousFolderId = folderHistory[folderHistory.length - 1];
      setfolderid(previousFolderId);
      setFolderHistory((prev) => prev.slice(0, -1));
    } else {
      setfolderid(null);
    }
  };

  const handleDelete = async (id, isFolder) => {
    try {
      await axios.delete(`http://localhost:5000/api/folder/delete/${id}?isFolder=${isFolder}`, {
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
        `http://localhost:5000/api/folder/toggle-visibility/${id}`,
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
    <div className="bg-gray-100 min-h-screen">
      <Layout sidebar>
        <h2 className="text-2xl font-semibold text-gray-700">
          {folderId === null ? 'Root Folder' : `Folder ID: ${folderId}`}
        </h2>

        <FileUpload onUpload={handleUpload} />

        <div className="flex gap-4 mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              const folderName = prompt('Enter folder name:');
              if (folderName) {
                handleCreateFolder(folderName);
              }
            }}
          >
            Create Folder
          </button>

          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={handleGoBack}
            disabled={folderHistory.length <= 0}
          >
            Go Back
          </button>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mt-6">Folders</h2>
        <ul className="space-y-2 mt-2">
          {folders.map((folder) => (
            <li key={folder._id} className="relative flex items-center justify-between bg-white p-2 rounded shadow">
              <button
                className="text-blue-600 font-medium hover:underline"
                onDoubleClick={() => handleNavigate(folder._id)}
              >
                {folder.name}
              </button>
              <div className="relative">
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setMenuVisible(menuVisible === folder._id ? null : folder._id)}
                >
                  ⋮
                </button>
                {menuVisible === folder._id && (
                  <div className="absolute right-0 bg-white border rounded shadow p-2 mt-2 space-y-2 z-10">
                    {folder.owner === currentUserId && (
                      <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(folder._id, true)}>
                        Delete
                      </button>
                    )}
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => toggleVisibility(folder._id, true, folder.public)}
                    >
                      {folder.isPublic ? 'Make Private' : 'Make Public'}
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold text-gray-700 mt-6">Files</h2>
        <ul className="space-y-2 mt-2">
          {files.map((file) => (
            <li key={file._id} className="relative flex items-center justify-between bg-white p-2 rounded shadow">
              <span>{file.filename}</span>
              <div className="relative">
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setMenuVisible(menuVisible === file._id ? null : file._id)}
                >
                  ⋮
                </button>
                {menuVisible === file._id && (
                  <div className="absolute right-0 bg-white border rounded shadow p-2 mt-2 space-y-2 z-10">
                    <button className="text-green-500 hover:text-green-700" onClick={() => handleDownload(file._id, file.filename)}>
                      Download
                    </button>
                    {file.owner === currentUserId && (
                      <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(file._id, false)}>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>

      </Layout>
    </div>
  );
};

export default Folder;
