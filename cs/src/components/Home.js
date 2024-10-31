// src/components/Home.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentFolder, uploadFile, createFolder } from '../api'; // Assume you have these functions in your api file

const Home = () => {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderName, setFolderName] = useState('');
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentFolder = async () => {
      const folder = await getCurrentFolder(); // Fetch current folder from backend
      setCurrentFolder(folder);
    };

    fetchCurrentFolder();
  }, []);

  const handleFolderCreate = async () => {
    if (folderName) {
      await createFolder(folderName); // Call your create folder API
      setFolderName('');
      // Optionally, refresh the folder list or redirect
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (file) {
      await uploadFile(file); // Call your upload file API
      setFile(null);
      // Optionally, refresh the folder contents or show a success message
    }
  };

  const handleFolderClick = (folderId) => {
    navigate(`/folder/${folderId}`); // Redirect to the selected folder
  };

  return (
    <div>
        <p>Hello</p>
      {/* <h1>{currentFolder?.name || 'Root Folder'}</h1>

      <input
        type="text"
        placeholder="New folder name"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
      />
      <button onClick={handleFolderCreate}>Create Folder</button>

      <form onSubmit={handleFileUpload}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button type="submit">Upload File</button>
      </form>

      <h2>Folders</h2>
      <ul>
        {currentFolder?.subfolders.map((folder) => (
          <li key={folder._id} onDoubleClick={() => handleFolderClick(folder._id)}>
            {folder.name}
          </li>
        ))}
      </ul>

      <h2>Files</h2>
      <ul>
        {currentFolder?.files.map((file) => (
          <li key={file._id}>
            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
              {file.filename}
            </a>
          </li>
        ))}
      </ul> */}
    </div>
  );
};

export default Home;
