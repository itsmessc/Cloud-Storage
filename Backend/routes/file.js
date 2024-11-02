const express = require('express');
const { uploadFile, getFileById, deleteFile, viewFile,compute } = require('../actions/file');
const upload = require('../middleware/multer'); // Import multer configuration
const { protect } = require('../middleware/auth'); // Ensure you create this middleware
const File = require('../models/file');
const router = express.Router();
const path = require('path');

// Upload a file to a folder (use multer to handle file upload)
router.post('/upload',protect, upload.single('file'),compute, uploadFile);

// Get a file by ID
router.get('/:id', getFileById);

// Delete a file by ID
router.delete('/:id', deleteFile);

router.get('/download/:id', protect, async (req, res) => {
    const fileId = req.params.id;
    console.log(fileId);
    try {
        // Find the file in the database
        const file = await File.findById(fileId); // Assuming you have a File model
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Construct the file path (assuming files are stored locally)
        const filePath = path.join(__dirname, '../', file.fileUrl); // Adjust path as needed

        // Send the file as a download
        res.download(filePath, file.originalName, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                return res.status(500).json({ message: 'Error downloading file' });
            }
        });
    } catch (error) {
        console.error("Download error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/file/:fileId', viewFile);

module.exports = router;
