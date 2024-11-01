const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const env = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/file');
const folderRoutes = require('./routes/folder');
const userRoutes = require('./routes/user');
// const { protect } = require('./middleware/auth');

const app =express()
env.config();
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('Database Connected'))
  .catch((err) => console.log('Connection error' + err));

  app.use(express.json()); // For parsing JSON bodies
  app.use(express.urlencoded({ extended: false })); // For parsing form data
  app.use('/upload', express.static('uploads')); // Static folder for uploaded files
  app.use(cors());
  // Routes
  app.use('/api/auth', authRoutes); // Authentication routes
  app.use('/api/file', fileRoutes); // File routes, protected by auth
  app.use('/api/folder', folderRoutes); // Folder routes, protected by auth
  app.use('/api/user', userRoutes); // Folder routes, protected by auth
  
  // Home Route
  app.get('/', (req, res) => {
    res.send('Welcome to the Cloud Storage API!');
  });
  
  // Start server
  const PORT = process.env.PORT || 7878;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


