/**
 * =====================================================
 * UPLOAD ROUTES
 * =====================================================
 * 
 * File upload endpoints using Cloudinary.
 * Handles profile images, documents, and medical files.
 * 
 * @layer Presentation/Routes
 * 
 * =====================================================
 * ENDPOINTS:
 * 
 * POST   /api/upload/profile        - Upload profile image
 * POST   /api/upload/document       - Upload general document
 * POST   /api/upload/medical        - Upload medical file
 * DELETE /api/upload/:publicId     - Delete uploaded file
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
 * =====================================================
 * UPLOAD PROFILE IMAGE
 * =====================================================
 */

/**
 * POST /api/upload/profile
 * 
 * Upload user profile image
 * 
 * @route POST /api/upload/profile
 * @access Private
 * @body {File} image - Image file (max 5MB)
 * 
 * @returns {200} - Uploaded image URL
 * @returns {400} - Invalid file type
 * @returns {401} - Not authenticated
 */
router.post('/profile', auth, uploadProfileImage.single('image'), async (req, res) => {
  try {
    console.log('[Upload] Profile image uploaded:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    res.json({
      message: 'Profile image uploaded successfully',
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error('[Upload] Profile upload error:', error.message);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

/**
 * =====================================================
 * UPLOAD DOCUMENT
 * =====================================================
 */

/**
 * POST /api/upload/document
 * 
 * Upload general document
 * 
 * @route POST /api/upload/document
 * @access Private (admin, receptionist)
 * @body {File} document - Document file (max 10MB)
 * 
 * @returns {200} - Uploaded document URL
 * @returns {400} - Invalid file
 * @returns {401} - Not authenticated
 * @returns {403} - Not authorized
 */
router.post('/document', auth, authorize('admin', 'receptionist'), uploadDocument.single('document'), async (req, res) => {
  try {
    console.log('[Upload] Document uploaded:', req.file);
    
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
    console.error('[Upload] Document upload error:', error.message);
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});

/**
 * =====================================================
 * UPLOAD MEDICAL FILE
 * =====================================================
 */

/**
 * POST /api/upload/medical
 * 
 * Upload medical file (lab reports, prescriptions, etc.)
 * 
 * @route POST /api/upload/medical
 * @access Private
 * @body {File} file - Medical file (max 10MB)
 * 
 * @returns {200} - Uploaded file URL
 * @returns {400} - Invalid file
 * @returns {401} - Not authenticated
 */
router.post('/medical', auth, uploadMedicalFile.single('file'), async (req, res) => {
  try {
    console.log('[Upload] Medical file uploaded:', req.file);
    
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
    console.error('[Upload] Medical file upload error:', error.message);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

/**
 * =====================================================
 * DELETE FILE
 * =====================================================
 */

/**
 * DELETE /api/upload/:publicId
 * 
 * Delete uploaded file from Cloudinary
 * 
 * @route DELETE /api/upload/:publicId
 * @access Private
 * @param {string} publicId - File's public ID
 * 
 * @returns {200} - File deleted
 * @returns {400} - Invalid public ID
 * @returns {401} - Not authenticated
 */
router.delete('/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    console.log('[Upload] Deleting file:', publicId);
    
    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    const result = await deleteFile(publicId);
    
    console.log('[Upload] File deleted:', result);
    
    res.json({
      message: 'File deleted successfully',
      result,
    });
  } catch (error) {
    console.error('[Upload] Delete error:', error.message);
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

/**
 * =====================================================
 * GET FILE URL
 * =====================================================
 */

/**
 * GET /api/upload/url/:publicId
 * 
 * Get file URL with optional transformations
 * 
 * @route GET /api/upload/url/:publicId
 * @access Public
 * @query {number} [width] - Resize width
 * @query {number} [height] - Resize height
 * @query {string} [crop] - Crop mode (fill, fit, scale, etc.)
 * 
 * @returns {200} - File URL
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
    console.error('[Upload] Get URL error:', error.message);
    res.status(500).json({ message: 'Error getting URL', error: error.message });
  }
});

// =====================================================
// EXPORTS
// =====================================================

module.exports = router;

// =====================================================
// DEBUG: Log route registration
// =====================================================
console.log('[Upload Routes] File upload routes loaded');
console.log('[Upload Routes] Available endpoints:');
console.log('  POST   /api/upload/profile     - Upload profile image');
console.log('  POST   /api/upload/document   - Upload document (admin/receptionist)');
console.log('  POST   /api/upload/medical    - Upload medical file');
console.log('  DELETE /api/upload/:publicId  - Delete file');
console.log('  GET    /api/upload/url/:publicId - Get file URL');
