import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress, Alert, Typography, Box
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import api from '../services/api';

const ImageUploadDialog = ({ open, onClose, entity, entityId, updateEndpoint, onSuccess, entityName }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentImage = entity?.profileImage;

  useEffect(() => {
    if (open) {
      setPreview(currentImage || null);
      setSelectedFile(null);
      setError('');
      setSuccess('');
    }
  }, [open, currentImage]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be less than 5MB'); return; }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      const res = await api.post('/upload/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await api.put(updateEndpoint, { profileImage: res.data.url });
      setSuccess('Image uploaded successfully');
      setSelectedFile(null);
      setTimeout(() => { onSuccess(); onClose(); }, 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      await api.put(updateEndpoint, { profileImage: '' });
      setSuccess('Image removed');
      setTimeout(() => { onSuccess(); onClose(); }, 800);
    } catch (err) {
      setError('Failed to remove image');
    }
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#344767' }}>
        Update Photo — {entityName || 'Profile'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 1 }}>
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current.click()}
            sx={{
              width: 160, height: 160, borderRadius: '50%',
              border: '3px dashed', borderColor: preview ? 'transparent' : '#1A73E8',
              bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'all 0.2s',
              '&:hover': { borderColor: '#4285F4', bgcolor: '#e3f2fd' },
            }}
          >
            {preview ? (
              <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <PhotoCameraIcon sx={{ fontSize: 40, color: '#1A73E8', mb: 0.5 }} />
                <Typography variant="caption" sx={{ color: '#1A73E8', display: 'block' }}>Click to upload</Typography>
              </Box>
            )}
          </Box>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          <Typography variant="caption" sx={{ color: '#7B809A', textAlign: 'center' }}>
            Drag & drop or click to select • Max 5MB • JPG, PNG, GIF, WebP
          </Typography>
          {currentImage && !selectedFile && (
            <Button size="small" startIcon={<DeleteForeverIcon />} color="error" onClick={handleRemove} disabled={uploading}
              sx={{ textTransform: 'none' }}>
              Remove Current Photo
            </Button>
          )}
          {error && <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%', borderRadius: 2 }}>{success}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleUpload} disabled={!selectedFile || uploading}
          startIcon={uploading ? <CircularProgress size={18} /> : <CloudUploadIcon />}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #1A73E8, #4285F4)' }}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageUploadDialog;
