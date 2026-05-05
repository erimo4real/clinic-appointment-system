import React, { useState } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import Sidenav from './Sidenav';
import Navbar from './Navbar';
import Footer from './Footer';

const DashboardLayout = ({ children }) => {
  const [sidenavOpen, setSidenavOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f0f2f5' }}>
      <Sidenav open={sidenavOpen} setOpen={setSidenavOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <Navbar onMenuToggle={() => setSidenavOpen(!sidenavOpen)} />
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1.5, sm: 2, md: 2.5 }, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {children}
          </Box>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
