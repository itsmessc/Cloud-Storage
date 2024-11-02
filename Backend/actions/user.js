const Folder = require("../models/folder");
const File = require("../models/file");
const User = require("../models/user");

// Controller function to fetch a user's folders and files
exports.getUserFoldersAndFiles = async (req, res) => {
    const { userId } = req.params;
     // Assumes `auth` middleware sets `req.user` with token payload

    try {
        // Verify that the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Determine query criteria based on whether the requester is the owner
        const folderCriteria = { owner: userId };
        
            folderCriteria.isPublic = true;
      

        // Find folders based on criteria
        const folders = await Folder.find(folderCriteria);

        // For each folder, find the files contained in it
        const foldersWithFiles = await Promise.all(
            folders.map(async (folder) => {
                const files = await File.find({ folder: folder._id });
                return { ...folder.toObject(), files }; // Spread folder data and add files
            })
        );
        console.log(foldersWithFiles);
        res.status(200).json(foldersWithFiles);
    } catch (error) {
        console.error('Error fetching folders and files:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
