const File = require('../models/file');
const Folder = require('../models/folder');
const fs = require('fs'); // For removing files from filesystem, if needed
const path = require('path'); // For filesystem paths

// Delete a file by ID
const deleteFile = async (fileId) => {
  try {
    const file = await File.findById(fileId);
    if (!file) throw new Error('File not found');

    // Optionally delete file from filesystem
    const filePath = path.resolve(file.fileUrl);

    // Delete the file from the filesystem
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file from filesystem:', err);
        throw new Error('Error deleting file from filesystem');
      }
    });

    // Delete file from database
    await File.deleteOne({ _id: fileId });
    return { message: 'File deleted successfully' };
  } catch (error) {
    throw error;
  }
};

// Recursively delete a folder and its contents
const deleteFolderRecursive = async (folderId) => {
  try {
    // Find all files in this folder and delete them
    const files = await File.find({ folder: folderId });
    for (const file of files) {
      await deleteFile(file._id);
    }

    // Find all subfolders within this folder
    const subfolders = await Folder.find({ parentFolder: folderId });
    for (const subfolder of subfolders) {
      await deleteFolderRecursive(subfolder._id); // Recursive deletion
    }

    // Finally, delete the folder itself
    await Folder.deleteOne({ _id: folderId });
    return { message: 'Folder and all its contents deleted successfully' };
  } catch (error) {
    throw error;
  }
};

// Main delete handler
const deleteItem = async (req, res) => {
  const { id } = req.params;
  const isFolder = req.query.isFolder === 'true';

  try {
    if (isFolder) {
      const result = await deleteFolderRecursive(id);
      res.json(result);
    } else {
      const result = await deleteFile(id);
      res.json(result);
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { deleteItem };
