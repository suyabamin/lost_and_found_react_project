import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import styles from '../styles/pages/Dashboard.module.css'
import { FaChartBar, FaChartPie, FaUsers, FaCheckCircle, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const Analytics = () => {
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Lost Items',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      },
      {
        label: 'Found Items',
        data: [28, 48, 40, 19, 86, 27],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
      },
    ],
  }

  const barData = {
    labels: ['Electronics', 'Pets', 'Documents', 'Keys', 'Bags'],
    datasets: [
      {
        label: 'Reports by Category',
        data: [120, 80, 150, 45, 90],
        backgroundColor: '#14b8a6',
      },
    ],
  }

  return (
    <div className={styles.dashboardPage}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.contentArea}>
          <div className={styles.sectionHeader}>
             <h2><FaChartBar /> Platform Analytics</h2>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6' }}><FaUsers /></div>
              <div className={styles.statInfo}>
                <h3>2,481</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><FaCheckCircle /></div>
              <div className={styles.statInfo}>
                <h3>85%</h3>
                <p>Recovery Rate</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><FaExclamationTriangle /></div>
              <div className={styles.statInfo}>
                <h3>142</h3>
                <p>Urgent Cases</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className={styles.statCard} style={{ display: 'block' }}>
               <h4 style={{ marginBottom: '20px' }}>Item Tracking Trends</h4>
               <Line data={lineData} />
            </div>
            <div className={styles.statCard} style={{ display: 'block' }}>
               <h4 style={{ marginBottom: '20px' }}>Category Distribution</h4>
               <Bar data={barData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Analytics
