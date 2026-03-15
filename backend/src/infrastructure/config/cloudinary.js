/**
 * =====================================================
 * CLOUDINARY CONFIGURATION
 * =====================================================
 * 
 * Cloudinary storage configuration for file uploads.
 * Handles image and file uploads for profiles, documents, etc.
 * 
 * @infrastructure Cloudinary
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

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * =====================================================
 * STORAGE CONFIGURATIONS
 * =====================================================
 */

// Profile images storage
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clinic-appointment/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
    public_id: (req, file) => `profile_${Date.now()}`,
  },
});

// Doctor documents storage
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clinic-appointment/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    resource_type: 'auto',
    public_id: (req, file) => `doc_${Date.now()}`,
  },
});

// Medical files storage
const medicalFileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clinic-appointment/medical-files',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    resource_type: 'auto',
    public_id: (req, file) => `medical_${Date.now()}`,
  },
});

/**
 * =====================================================
 * MULTER UPLOAD INSTANCES
 * =====================================================
 */

// Upload middleware for profile images
const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profiles'), false);
    }
  },
});

// Upload middleware for documents
const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// Upload middleware for medical files
const uploadMedicalFile = multer({
  storage: medicalFileStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

/**
 * =====================================================
 * HELPER FUNCTIONS
 * =====================================================
 */

/**
 * Upload image from base64 string
 * 
 * @async
 * @function uploadBase64Image
 * @param {string} base64String - Base64 encoded image
 * @param {Object} options - Upload options (folder, transformation)
 * @returns {Promise<Object>} Upload result
 */
const uploadBase64Image = async (base64String, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: options.folder || 'clinic-appointment/misc',
      transformation: options.transformation || [],
    });
    return result;
  } catch (error) {
    console.error('[Cloudinary] Base64 upload error:', error.message);
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 * 
 * @async
 * @function deleteFile
 * @param {string} publicId - File's public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('[Cloudinary] Delete error:', error.message);
    throw error;
  }
};

/**
 * Get file URL
 * 
 * @function getFileUrl
 * @param {string} publicId - File's public ID
 * @param {Object} options - URL options (transformation)
 * @returns {string} File URL
 */
const getFileUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
};

/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */

module.exports = {
  cloudinary,
  uploadProfileImage,
  uploadDocument,
  uploadMedicalFile,
  uploadBase64Image,
  deleteFile,
  getFileUrl,
};

// =====================================================
// DEBUG: Log configuration
// =====================================================
console.log('[Cloudinary] Configuration loaded');
console.log('[Cloudinary] Cloud name:', process.env.CLOUDINARY_CLOUD_NAME || 'Not configured');
