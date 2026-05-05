import React, { useMemo } from 'react';
import { Card, CardContent, Box } from '@mui/material';
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

const ReportsLineChart = ({ data = {} }) => {
  const labels = data.labels || ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const values = data.values || [50, 40, 300, 220, 500, 250, 400, 230, 500];

  const chartData = useMemo(() => ({
    labels,
    datasets: [{
      label: 'Revenue',
      data: values,
      borderColor: '#1A73E8',
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return 'rgba(26,115,232,0.05)';
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(26,115,232,0.15)');
        gradient.addColorStop(1, 'rgba(26,115,232,0.01)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: '#1A73E8',
      borderWidth: 2,
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
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }), []);

  return (
    <Card sx={{ borderRadius: 1, height: '100%', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1, px: 2, py: 2 }}>
          <Line data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReportsLineChart;
