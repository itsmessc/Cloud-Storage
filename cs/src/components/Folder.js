import React, { useEffect, useState } from 'react';
import FileUpload from './xx'; // Replace with actual import
import axios from 'axios';

const Folder = () => {
  const token = localStorage.getItem('token');
  const [folderId, setfolderid] = useState(null); // Root folder starts as null
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [folderHistory, setFolderHistory] = useState([null]); // History starts with root folder (null)

  // Fetch folders and files based on folderId
  useEffect(() => {
    const fetchData = async () => {
      try {
        let res;
        if (folderId) {
          res = await axios.get(`http://localhost:5000/api/folder/find?id=${folderId}`);
        } else {
          res = await axios.get(`http://localhost:5000/api/folder/find`);
        }
        setFolders(res.data.folders); // Set folders from response
        setFiles(res.data.files);     // Set files from response
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };

    fetchData();
  }, [folderId, token]);

  // Handle folder creation
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

  // Handle file upload
  const handleUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
if(folderId){
      formData.append('folder', folderId); // Append folderId if not root folder
}
      const res = await axios.post('http://localhost:5000/api/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('File uploaded successfully:', res.data);
      setFiles((prev) => [...prev, res.data.file]); // Update files with newly uploaded file
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Navigate to a folder
  const handleNavigate = (id) => {
    if (folderId !== null) {
      setFolderHistory((prev) => [...prev, folderId]); // Push current folderId to history
    }
    setfolderid(id); // Set folderId to navigate to the new folder
  };

  // Go back to the previous folder
  const handleGoBack = () => {
    if (folderHistory.length > 1) {
      const previousFolderId = folderHistory[folderHistory.length - 1]; // Get the second last item in history
      setfolderid(previousFolderId); // Navigate to the previous folder
      setFolderHistory((prev) => prev.slice(0, -1)); // Remove current folder from history
    } else {
      setfolderid(null); // Go back to root folder if no more history
    }
  };

  return (
    <div>
      <h2>{folderId === null ? 'Root Folder' : `Folder ID: ${folderId}`}</h2>

      <FileUpload onUpload={handleUpload} />

      <button onClick={() => {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
          handleCreateFolder(folderName);
        }
      }}>
        Create Folder
      </button>

      <button onClick={handleGoBack} disabled={folderHistory.length <= 0}>
        Go Back
      </button>

      <h2>Folders</h2>
      <ul>
        {folders.map((folder) => (
          <li key={folder._id}>
            <button onDoubleClick={() => handleNavigate(folder._id)}>
              {folder.name}
            </button>
          </li>
        ))}
      </ul>

      <h2>Files</h2>
      <ul>
        {files.map((file) => (
          <li key={file._id}>
            {file.filename}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Folder;
