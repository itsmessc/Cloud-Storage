const File = require('../models/file');
const Folder = require('../models/folder');

// Upload File to a Folder
const uploadFile = async (req, res) => {
  console.log(req.body);
  const { folder, isPublic } = req.body;
  const file = req.file; // The uploaded file from multer

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    if(folder){
      const folders = await Folder.findById(folder);
      console.log(folders);
      if (!folders) return res.status(404).json({ message: 'Folder not found' });
    }

    // Use the authenticated user's id and username from the protect middleware
    const newFile = new File({
      filename: file.originalname,
      fileUrl: file.path, // Path where the file is stored locally
      folder: folder,
      owner: req.user._id, // Set the owner from the authenticated user
      ownerUsername: req.user.username, // Set the owner's username
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

module.exports = { uploadFile, getFileById, deleteFile ,viewFile};
