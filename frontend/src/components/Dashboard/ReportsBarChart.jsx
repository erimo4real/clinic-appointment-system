import React, { useMemo } from 'react';
import { Card, CardContent, Box, Typography, Divider } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const ReportsBarChart = ({ data = {}, title, description, color = 'info' }) => {
  const labels = data.labels || ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const values = data.values || [4500, 5200, 4800, 6100, 5500, 3200, 2800];

  const colorMap = {
    primary: '#1A73E8',
    secondary: '#7B809A',
    success: '#4CAF50',
    info: '#1A73E8',
    warning: '#FF9800',
    error: '#F44336',
    dark: '#344767',
  };
  const barColor = colorMap[color] || colorMap.info;

  const chartData = useMemo(() => ({
    labels,
    datasets: [{
      label: title || 'Appointments',
      data: values,
      backgroundColor: barColor,
      borderRadius: 4,
      borderSkipped: false,
      barPercentage: 0.55,
      categoryPercentage: 0.7,
    }],
  }), [labels, values, barColor, title]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#344767',
        bodyColor: '#7B809A',
        borderColor: '#e5e5e5',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#7B809A', font: { size: 10 } },
        border: { display: false },
      },
      y: {
        grid: { color: '#f0f0f0', drawBorder: false },
        ticks: { color: '#7B809A', font: { size: 10 }, padding: 4 },
        beginAtZero: true,
        border: { display: false },
      },
    },
  }), [barColor]);

  return (
    <Card sx={{ borderRadius: 1, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
      <CardContent sx={{ p: '1rem 1rem 0' }}>
        <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
          {title || 'Appointments'}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ color: '#344767', fontWeight: 600, fontSize: '0.875rem', mt: 0.5 }}>
            {description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#7B809A', fontSize: '0.75rem' }}>
            as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Typography>
        </Box>
      </CardContent>
      <Divider sx={{ mx: 2 }} />
      <CardContent sx={{ p: 0, pb: '0.5rem !important' }}>
        <Box sx={{ px: 1.5, py: 1.5, height: 250 }}>
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReportsBarChart;
