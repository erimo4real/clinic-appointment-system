/**
 * =====================================================
 * UPLOAD ROUTES
 * =====================================================
 * 
 * HTTP endpoints for file uploads via Cloudinary.
 * Handles profile images, documents, and medical files.
 * 
 * @layer Presentation/Routes
 * =====================================================
 * ENDPOINTS:
 * 
 * POST   /api/upload/profile  - Upload profile image
 * POST   /api/upload/document - Upload general document
 * POST   /api/upload/medical  - Upload medical file
 * DELETE /api/upload/:publicId - Delete uploaded file
 * GET    /api/upload/url/:publicId - Get file URL with transformations
 * =====================================================
 */

const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../../infrastructure/middleware/auth');
const {
  uploadProfileImage,
  uploadDocument,
  uploadMedicalFile,
  deleteFile,
  getFileUrl
} = require('../../infrastructure/config/cloudinary');

/**
 * POST /api/upload/profile
 * 
 * Uploads a user profile image.
 * Images are automatically resized and cropped.
 * 
 * @route POST /api/upload/profile
 * @requires Authentication
 * @body {File} image - Image file (JPEG, PNG, GIF, WebP; max 5MB)
 * @returns {200} { message, url, publicId }
 * @returns {400} No image provided or invalid file type
 */
router.post('/profile', auth, uploadProfileImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    res.json({
      message: 'Profile image uploaded successfully',
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

/**
 * POST /api/upload/document
 * 
 * Uploads a general document.
 * Accessible by admin and receptionist roles.
 * 
 * @route POST /api/upload/document
 * @requires Authentication (admin, receptionist)
 * @body {File} document - Document file (JPEG, PNG, PDF, DOC, DOCX; max 10MB)
 * @returns {200} { message, url, publicId, format, size }
 * @returns {400} No document provided
 * @returns {403} Not authorized
 */
router.post('/document', auth, authorize('admin', 'receptionist'), uploadDocument.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No document file provided' });
    }

    res.json({
      message: 'Document uploaded successfully',
      url: req.file.path,
      publicId: req.file.filename,
      format: req.file.format,
      size: req.file.size,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});

/**
 * POST /api/upload/medical
 * 
 * Uploads a medical file (lab reports, prescriptions, etc.).
 * Accessible by all authenticated users.
 * 
 * @route POST /api/upload/medical
 * @requires Authentication
 * @body {File} file - Medical file (JPEG, PNG, PDF, DOC, DOCX; max 10MB)
 * @returns {200} { message, url, publicId, format, size }
 * @returns {400} No file provided
 */
router.post('/medical', auth, uploadMedicalFile.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    res.json({
      message: 'Medical file uploaded successfully',
      url: req.file.path,
      publicId: req.file.filename,
      format: req.file.format,
      size: req.file.size,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

/**
 * DELETE /api/upload/:publicId
 * 
 * Deletes an uploaded file from Cloudinary.
 * 
 * @route DELETE /api/upload/:publicId
 * @requires Authentication
 * @param {string} publicId - Cloudinary public ID of the file
 * @returns {200} { message, result }
 * @returns {400} Public ID required
 */
router.delete('/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    const result = await deleteFile(publicId);
    
    res.json({
      message: 'File deleted successfully',
      result,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

/**
 * GET /api/upload/url/:publicId
 * 
 * Retrieves a file URL with optional transformations.
 * Public endpoint - no authentication required.
 * 
 * @route GET /api/upload/url/:publicId
 * @param {string} publicId - Cloudinary public ID
 * @query {number} width - Resize width (optional)
 * @query {number} height - Resize height (optional)
 * @query {string} crop - Crop mode: fill, fit, scale, etc. (optional)
 * @returns {200} { url }
 */
router.get('/url/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const { width, height, crop } = req.query;
    
    const options = {};
    if (width) options.width = parseInt(width);
    if (height) options.height = parseInt(height);
    if (crop) options.crop = crop;
    
    const url = getFileUrl(publicId, options);
    
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Error getting URL', error: error.message });
  }
});

module.exports = router;
