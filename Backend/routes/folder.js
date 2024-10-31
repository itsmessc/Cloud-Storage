// const express = require('express');
// const { createFolder, getFolderContents, deleteFolder } = require('../actions/folder');
// const router = express.Router();

// // Create a folder
// router.post('/create', createFolder);

// // Get contents of a folder (files + subfolders)
// router.get('/:id', getFolderContents);

// // Delete a folder (only owner can delete)
// router.delete('/:id', deleteFolder);

// module.exports = router;

const express = require('express');
const Folder = require('../models/folder');
const { protect } = require('../middleware/auth'); // Ensure you create this middleware
const router = express.Router();
const File =require('../models/file');
const { deleteItem } = require('../actions/delete');
const { toggleFolderVisibility } = require('../actions/folder');

// Create a new folder
router.post('/create',protect, async (req, res) => {
    const { name, parentFolder, path, isPublic } = req.body;
    try {
        const newFolder = new Folder({
            name,
            owner: req.user.id,
            parentFolder,
            path,
            isPublic,
        });
        await newFolder.save();
        res.status(201).json(newFolder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.patch('/toggle-visibility/:folderId', protect, toggleFolderVisibility);
// Get subfolders and files of a specific folder
router.post('/find',protect, async (req, res) => {
    try {
        const { id } = req.query;
        const folders = await Folder.find({ parentFolder: id ,owner: req.user.id});
        const files = await File.find({ folder: id ,owner: req.user.id});
        res.json({ folders, files });
        console.log(id+folders+files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/delete/:id',protect,deleteItem);

module.exports = router;
