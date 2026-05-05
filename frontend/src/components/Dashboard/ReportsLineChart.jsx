import React, { useMemo } from 'react';
import { Card, CardContent, Box, Typography, Divider } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const ReportsLineChart = ({ data = {}, title, description, color = 'info' }) => {
  const labels = data.labels || ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const values = data.values || [50, 40, 300, 220, 500, 250, 400, 230, 500];

  const colorMap = {
    primary: '#1A73E8',
    secondary: '#7B809A',
    success: '#4CAF50',
    info: '#1A73E8',
    warning: '#FF9800',
    error: '#F44336',
    dark: '#344767',
  };
  const lineColor = colorMap[color] || colorMap.info;

  const chartData = useMemo(() => ({
    labels,
    datasets: [{
      label: title || 'Revenue',
      data: values,
      borderColor: lineColor,
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return `${lineColor}08`;
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, `${lineColor}26`);
        gradient.addColorStop(1, `${lineColor}02`);
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: lineColor,
      borderWidth: 2,
    }],
  }), [labels, values, lineColor, title]);

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
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }), [lineColor]);

  return (
    <Card sx={{ borderRadius: 1, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
      <CardContent sx={{ p: '1rem 1rem 0' }}>
        <Typography variant="caption" sx={{ color: '#7B809A', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
          {title || 'Revenue'}
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
          <Line data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReportsLineChart;
