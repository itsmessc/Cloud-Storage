const Folder = require('../models/folder');
const File = require('../models/file');

// Create Folder
const createFolder = async (req, res) => {
  const { name, ownerId, parentFolderId, isPublic } = req.body;

  try {
    // Get the path of the parent folder
    let path = '';
    if (parentFolderId) {
      const parentFolder = await Folder.findById(parentFolderId);
      if (!parentFolder) return res.status(404).json({ message: 'Parent folder not found' });
      path = `${parentFolder.path}/${parentFolder.name}`;
    }

    const newFolder = new Folder({
      name,
      owner: ownerId,
      parentFolder: parentFolderId || null,
      path,
      isPublic,
    });

    await newFolder.save();
    res.status(201).json({ message: 'Folder created successfully', folder: newFolder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get Folder Contents
const getFolderContents = async (req, res) => {
  const { id } = req.params;

  try {
    const folder = await Folder.findById(id);
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    // Fetch files and subfolders under this folder
    const files = await File.find({ folder: id });
    const subfolders = await Folder.find({ parentFolder: id });

    res.json({ folder, files, subfolders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete Folder (Owner only)
const deleteFolder = async (req, res) => {
  const { id } = req.params;

  try {
    const folder = await Folder.findById(id);
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    if (req.userId !== folder.owner.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete all files and subfolders recursively
    await deleteFolderRecursively(id);
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Helper function to delete folder and its contents recursively
const deleteFolderRecursively = async (folderId) => {
  const subfolders = await Folder.find({ parentFolder: folderId });
  for (const subfolder of subfolders) {
    await deleteFolderRecursively(subfolder._id);
  }
  await File.deleteMany({ folder: folderId });
  await Folder.findByIdAndDelete(folderId);
};

const toggleFolderAndContentsVisibility = async (folderId, isPublic) => {
  // Update the folder's visibility
  await Folder.findByIdAndUpdate(folderId, { isPublic });

  // Update all files in the folder
  await File.updateMany({ folder: folderId }, { isPublic });

  // Find all subfolders within this folder
  const subfolders = await Folder.find({ parentFolder: folderId });

  // Recursively update each subfolder
  for (const subfolder of subfolders) {
    await toggleFolderAndContentsVisibility(subfolder._id, isPublic);
  }
};

// Controller function to handle the request
const toggleFolderVisibility = async (req, res) => {
  const { folderId } = req.params;
  const userId = req.user.id; // Assumes `auth` middleware sets `req.user`

  try {
    // Find the folder by ID
    const folder = await Folder.findById(folderId);

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check if the user is the owner of the folder
    if (folder.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Toggle the visibility status
    const newVisibility = !folder.isPublic;

    // Recursively update folder and contents visibility
    await toggleFolderAndContentsVisibility(folderId, newVisibility);

    res.status(200).json({ message: `Folder and contents made ${newVisibility ? 'public' : 'private'}` });
  } catch (error) {
    console.error('Error toggling folder visibility:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createFolder, getFolderContents, deleteFolder,toggleFolderVisibility };
