import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        borderTop: '1px solid #f0f0f0',
        py: 1.5,
        px: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MedicalServicesIcon sx={{ fontSize: 18, color: '#1A73E8' }} />
          <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600 }}>
            MedBook Pro
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#aaa' }}>
          © {currentYear} Clinic Appointment Management System
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
