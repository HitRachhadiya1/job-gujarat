const multer = require('multer');

// Use memory storage for Supabase upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Middleware to handle single logo file under field name 'logo'
const uploadSingleLogo = upload.single('logo');

module.exports = { uploadSingleLogo };
