import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const StatsCard = ({ icon, title, count, percentage, color = 'info' }) => {
  const theme = useTheme();

  const colorMap = {
    info: { bg: 'linear-gradient(135deg, #17C1E8 0%, #21D4FD 100%)', icon: '#fff' },
    success: { bg: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)', icon: '#fff' },
    error: { bg: 'linear-gradient(135deg, #F44335 0%, #E57373 100%)', icon: '#fff' },
    warning: { bg: 'linear-gradient(135deg, #FB8C00 0%, #FFB74D 100%)', icon: '#fff' },
    primary: { bg: 'linear-gradient(135deg, #1A73E8 0%, #4285F4 100%)', icon: '#fff' },
  };

  const { bg } = colorMap[color] || colorMap.info;
  const isPositive = percentage?.color === 'success' || percentage?.color === 'green';

  return (
    <Card sx={{ borderRadius: 3, overflow: 'visible' }}>
      <CardContent sx={{ p: 2.5, pb: '0.8rem !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#7B809A', mb: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#344767', mb: 0.5 }}>
              {count}
            </Typography>
            {percentage && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: isPositive ? '#4CAF50' : '#F44335',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  {isPositive ? '+' : ''}{percentage.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7B809A', fontSize: '0.75rem' }}>
                  {percentage.label}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              background: bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 22, ...icon.props.sx } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
