import React, { useState, useRef } from 'react';
import { optimizeImage, validateImageFile, formatFileSize, createThumbnail } from '../../utils/imageUtils';
import OptimizedImage from './OptimizedImage';

const ImageUpload = ({
  onImageSelect,
  onImageRemove,
  currentImage = null,
  label = 'Upload Image',
  maxSizeInMB = 5,
  aspectRatio = '1/1',
  className = '',
}) => {
  const [preview, setPreview] = useState(currentImage);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [optimizedSize, setOptimizedSize] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    
    const validation = validateImageFile(file, { maxSizeInMB });
    if (!validation.valid) {
      setError(validation.errors.join('. '));
      return;
    }

    setOriginalSize(file.size);
    setIsOptimizing(true);

    try {
      const optimized = await optimizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        format: 'image/jpeg',
      });

      const thumbnail = await createThumbnail(optimized, 200);

      setOptimizedSize(optimized.size);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(optimized);

      if (onImageSelect) {
        onImageSelect({
          original: file,
          optimized,
          thumbnail,
          preview: URL.createObjectURL(optimized),
          originalSize: file.size,
          optimizedSize: optimized.size,
        });
      }
    } catch (err) {
      setError('Failed to optimize image. Please try again.');
      console.error('Image optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setOriginalSize(null);
    setOptimizedSize(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemove) {
      onImageRemove();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {preview ? (
        <div className="relative">
          <div className="aspect-square max-w-xs mx-auto">
            <OptimizedImage
              src={preview}
              alt="Preview"
              className="w-full h-full"
              rounded="xl"
            />
          </div>
          
          {isOptimizing ? (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm">Optimizing...</p>
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {originalSize && optimizedSize ? (
                <span>
                  {formatFileSize(originalSize)} → {formatFileSize(optimizedSize)}
                  <span className="text-green-600 ml-1">
                    ({Math.round((1 - optimizedSize / originalSize) * 100)}% smaller)
                  </span>
                </span>
              ) : (
                <span>{formatFileSize(originalSize || 0)}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClick}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed border-gray-300 rounded-xl p-8
            flex flex-col items-center justify-center gap-3
            cursor-pointer hover:border-teal-400 hover:bg-teal-50/50
            transition-all duration-200
            ${isOptimizing ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {isOptimizing ? 'Optimizing...' : 'Click or drag to upload'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG or WebP (max {maxSizeInMB}MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
