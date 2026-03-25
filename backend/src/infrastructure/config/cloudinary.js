/**
 * =====================================================
 * CLOUDINARY CONFIGURATION
 * =====================================================
 * 
 * Cloudinary integration for file uploads.
 * Handles profile images, documents, and medical files
 * with automatic optimization and storage.
 * 
 * =====================================================
 * ENVIRONMENT VARIABLES REQUIRED:
 * - CLOUDINARY_CLOUD_NAME: Your cloud name
 * - CLOUDINARY_API_KEY: Your API key
 * - CLOUDINARY_API_SECRET: Your API secret
 * =====================================================
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==========================================
// STORAGE CONFIGURATIONS
// ==========================================

/**
 * Storage for profile images
 * Automatically resizes and crops to 500x500
 */
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clinic-appointment/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
    public_id: (req, file) => `profile_${Date.now()}`,
  },
});

/**
 * Storage for general documents
 * Supports multiple file formats
 */
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clinic-appointment/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    resource_type: 'auto',
    public_id: (req, file) => `doc_${Date.now()}`,
  },
});

/**
 * Storage for medical files
 * Supports medical document formats
 */
const medicalFileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clinic-appointment/medical-files',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    resource_type: 'auto',
    public_id: (req, file) => `medical_${Date.now()}`,
  },
});

// ==========================================
// MULTER UPLOAD INSTANCES
// ==========================================

/**
 * Multer middleware for profile image uploads
 * Max file size: 5MB
 * Allowed types: Images only
 */
const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profiles'), false);
    }
  },
});

/**
 * Multer middleware for document uploads
 * Max file size: 10MB
 */
const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * Multer middleware for medical file uploads
 * Max file size: 10MB
 */
const uploadMedicalFile = multer({
  storage: medicalFileStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Uploads an image from a base64 string.
 * 
 * @param {string} base64String - Base64 encoded image
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadBase64Image = async (base64String, options = {}) => {
  return await cloudinary.uploader.upload(base64String, {
    folder: options.folder || 'clinic-appointment/misc',
    transformation: options.transformation || [],
  });
};

/**
 * Deletes a file from Cloudinary.
 * 
 * @param {string} publicId - File's public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteFile = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

/**
 * Gets a file URL with optional transformations.
 * 
 * @param {string} publicId - File's public ID
 * @param {Object} options - URL transformation options
 * @returns {string} File URL
 */
const getFileUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  cloudinary,
  uploadProfileImage,
  uploadDocument,
  uploadMedicalFile,
  uploadBase64Image,
  deleteFile,
  getFileUrl,
};
