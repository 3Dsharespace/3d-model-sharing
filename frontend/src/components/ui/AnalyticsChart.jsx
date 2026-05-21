import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const AnalyticsChart = ({ 
  data, 
  type = 'line', 
  title, 
  color = '#3b82f6',
  height = 200,
  showLegend = false 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">📊</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const chartData = type === 'pie' ? {
    labels: data.map(item => item.name || item.label || ''),
    datasets: [
      {
        data: data.map(item => item.value || item.count || 0),
        backgroundColor: data.map((_, index) => {
          const colors = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
            '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
          ]
          return colors[index % colors.length]
        }),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
      }
    ]
  } : {
    labels: data.map(item => {
      // Format date labels
      if (item.date) {
        const date = new Date(item.date)
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      }
      if (item.hour) {
        return `${item.hour}:00`
      }
      return item.label || ''
    }),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value || item.count || 0),
        borderColor: color,
        backgroundColor: type === 'line' 
          ? `${color}20` // 20% opacity for line fill
          : `${color}80`, // 80% opacity for bars
        borderWidth: type === 'line' ? 3 : 1,
        fill: type === 'line',
        tension: type === 'line' ? 0.4 : 0,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  }

  const options = type === 'pie' ? {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ${context.parsed} (${percentage}%)`
          }
        }
      }
    }
  } : {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context) {
            if (data[context[0].dataIndex]?.date) {
              const date = new Date(data[context[0].dataIndex].date)
              return date.toLocaleDateString('en-IN', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })
            }
            return context[0].label
          },
          label: function(context) {
            return `${title}: ${context.parsed.y}`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          },
          maxTicksLimit: 8
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          },
          callback: function(value) {
            return value.toLocaleString()
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      point: {
        hoverBackgroundColor: color,
      }
    }
  }

  return (
    <div style={{ height: `${height}px` }}>
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : type === 'bar' ? (
        <Bar data={chartData} options={options} />
      ) : (
        <Pie data={chartData} options={options} />
      )}
    </div>
  )
}

export default AnalyticsChart
