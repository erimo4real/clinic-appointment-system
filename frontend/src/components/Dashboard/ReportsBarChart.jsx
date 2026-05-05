import React, { useMemo } from 'react';
import { Card, CardContent, Box } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const ReportsBarChart = ({ data = {} }) => {
  const labels = data.labels || ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const values = data.values || [4500, 5200, 4800, 6100, 5500, 3200, 2800];

  const chartData = useMemo(() => ({
    labels,
    datasets: [{
      label: 'Appointments',
      data: values,
      backgroundColor: values.map((_, i) => {
        const colors = [
          '#1A73E8', '#4285F4', '#1A73E8', '#4285F4', '#1A73E8', '#4285F4', '#1A73E8'
        ];
        return colors[i % colors.length];
      }),
      borderRadius: 4,
      borderSkipped: false,
      barPercentage: 0.55,
      categoryPercentage: 0.7,
    }],
  }), [labels, values]);

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
  }), []);

  return (
    <Card sx={{ borderRadius: 1, height: '100%', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1, px: 2, py: 2 }}>
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReportsBarChart;
