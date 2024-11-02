const File = require('../models/file');
const Folder = require('../models/folder');


const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const multer = require('multer');
const path = require('path');
const tempDir = 'upload/';

const upload = multer({ dest: tempDir });
// Upload File to a Folder
const uploadFile = async (req, res) => {
  const { folder, isPublic } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Check if folder exists if specified
    if (folder) {
      const folders = await Folder.findById(folder);
      if (!folders) return res.status(404).json({ message: 'Folder not found' });
    }

    // Generate unique filename if a file with the same name exists
    let uniqueFilename = file.originalname;
    let counter = 1;
    while (await File.findOne({ filename: uniqueFilename, folder })) {
      const fileParts = file.originalname.split('.');
      const fileExtension = fileParts.length > 1 ? `.${fileParts.pop()}` : '';
      const fileBaseName = fileParts.join('.');
      uniqueFilename = `${fileBaseName}_${counter}${fileExtension}`;
      counter++;
    }

    // Create new file record in MongoDB
    const newFile = new File({
      filename: uniqueFilename,
      fileUrl: file.path,
      folder: folder,
      owner: req.user._id,
      ownerUsername: req.user.username,
      isPublic: isPublic || false,
      size: file.size,
      fileType: file.mimetype,
    });

    await newFile.save();
    res.status(201).json({ message: 'File uploaded successfully', file: newFile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};



// Get File by ID
const getFileById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Check if file is public or owned by the user
    if (!file.isPublic && req.userId !== file.owner.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete File (Owner only)
const deleteFile = async (req, res) => {
  const { id } = req.params;
  try {
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Check if the request is made by the owner
    if (req.userId !== file.owner.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await file.deleteOne();
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const viewFile = async (req, res) => {
  const { fileId } = req.params;

  try {
      // Find the file by ID
      const file = await File.findById(fileId);

      if (!file) {
          return res.status(404).json({ message: 'File not found' });
      }

      // Full path to the file on the server
      const filePath = path.join(__dirname, '../', file.fileUrl);

      // Check if the file exists on the server
      if (!fs.existsSync(filePath)) {
          return res.status(404).json({ message: 'File not found on the server' });
      }

      // Set headers to open the PDF in the browser
      res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
      res.setHeader('Content-Type', file.fileType || 'application/pdf'); // Should be application/pdf for PDFs

      // Stream the file to the response
      const fileStream = fs.createReadStream(filePath);
      fileStream.on('error', (streamError) => {
        console.error('Error reading file stream:', streamError);
        res.status(500).json({ message: 'Error reading file' });
    });

    // Pipe the file stream to the response
    fileStream.pipe(res);
  } catch (error) {
      console.error('Error displaying file:', error);
      res.status(500).json({ message: 'Server error' });
  }
};

async function compute(req, res, next) {
  try {
    // Ensure the file was uploaded by the previous middleware (multer)
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded for processing' });
    }

    // Prepare form data for FastAPI
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

    // Send the file to FastAPI
    const fastapiResponse = await axios.post('https://pretty-em-ssc2334-cb2b05d6.koyeb.app/compute-hash/compute-hash/', form, {
      headers: form.getHeaders(),
      responseType: 'arraybuffer', // Expect a file response (PDF) if applicable
    });

    // Clean up the original file after sending it to FastAPI
    fs.unlinkSync(req.file.path);

    // Save the processed file returned from FastAPI to a new temporary file
    const processedFilePath = path.join(tempDir, `processed_${Date.now()}_${req.file.originalname}`);
    fs.writeFileSync(processedFilePath, fastapiResponse.data);

    // Replace req.file with the processed file data
    req.file = {
      ...req.file, // Retain other metadata from the original file
      path: processedFilePath, // New path for the processed file
      buffer: fastapiResponse.data, // Store file content as buffer if needed
      size: fastapiResponse.data.length,
      mimetype: fastapiResponse.headers['content-type'] || req.file.mimetype,
    };

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error('Error in compute middleware:', error.message);
    res.status(500).json({ error: 'Failed to process file with FastAPI' });
  }
}
module.exports = { uploadFile, getFileById, deleteFile ,viewFile,compute};
