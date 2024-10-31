// src/components/FolderList.js
import React from 'react';

const FolderList = ({ folders, files, onNavigate }) => {
  return (
    <div>
      <h3>Folders</h3>
      <ul>
        {folders.map((folder, index) => (
          <li key={index} onDoubleClick={() => onNavigate(folder)}>
            {folder.name}
          </li>
        ))}
      </ul>

      <h3>Files</h3>
      <ul>
        {files.map((file, index) => (
          <li key={index}>{file}</li>
        ))}
      </ul>
    </div>
  );
};

export default FolderList;
