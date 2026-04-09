const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.8;
const OUTPUT_FORMAT = 'image/jpeg';

export const optimizeImage = async (file, options = {}) => {
  const {
    maxWidth = MAX_WIDTH,
    maxHeight = MAX_HEIGHT,
    quality = QUALITY,
    format = OUTPUT_FORMAT,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                type: format,
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              reject(new Error('Failed to optimize image'));
            }
          },
          format,
          quality
        );
      };
      
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  });
};

export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

export const validateImageFile = (file, options = {}) => {
  const {
    maxSizeInMB = 5,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  } = options;
  
  const errors = [];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSizeInMB * 1024 * 1024) {
    errors.push(`File too large. Maximum size: ${maxSizeInMB}MB`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

export const createThumbnail = async (file, size = 200) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const aspectRatio = img.width / img.height;
        
        let thumbWidth, thumbHeight;
        if (aspectRatio > 1) {
          thumbWidth = size;
          thumbHeight = Math.round(size / aspectRatio);
        } else {
          thumbHeight = size;
          thumbWidth = Math.round(size * aspectRatio);
        }
        
        canvas.width = thumbWidth;
        canvas.height = thumbHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const thumbFile = new File([blob], `thumb_${file.name}`, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(thumbFile);
            } else {
              reject(new Error('Failed to create thumbnail'));
            }
          },
          'image/jpeg',
          0.7
        );
      };
      
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  });
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
