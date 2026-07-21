const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'instagram-clone', // all uploads go into this Cloudinary folder
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'webm'],
    resource_type: 'auto', // auto-detects image vs video
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

module.exports = upload;