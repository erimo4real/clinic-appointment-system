import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert, Snackbar, Box, IconButton, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

const ToastContext = createContext(null);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 20000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  const severityMap = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  const iconMap = {
    success: <CheckCircleIcon fontSize="small" />,
    error: <ErrorIcon fontSize="small" />,
    warning: <WarningIcon fontSize="small" />,
    info: <InfoIcon fontSize="small" />,
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: 448,
      }}
    >
      {toasts.map((t, index) => (
        <Collapse
          key={t.id}
          in={true}
          timeout={{ appear: 300, enter: 300, exit: 200 }}
          sx={{ animation: `slideIn 0.3s ease-out ${index * 50}ms both` }}
        >
          <Alert
            severity={severityMap[t.type]}
            icon={iconMap[t.type]}
            variant="filled"
            sx={{
              borderRadius: 2,
              boxShadow: 6,
              '& .MuiAlert-message': {
                fontSize: '0.875rem',
                fontWeight: 600,
              },
            }}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => onRemove(t.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {t.message}
          </Alert>
        </Collapse>
      ))}
    </Box>
  );
};

const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export { ToastProvider, useToast };
export default ToastContext;
