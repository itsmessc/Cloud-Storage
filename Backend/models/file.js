const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  fileUrl: { type: String, required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder',default: null},  // File belongs to a folder
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerUsername: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  fileType: { type: String, required: true },
  version: { type: Number, default: 1 },
});

module.exports = mongoose.model('File', fileSchema);
