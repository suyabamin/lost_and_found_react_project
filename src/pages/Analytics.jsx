import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import styles from '../styles/pages/Dashboard.module.css'
import { FaChartBar, FaUsers, FaUserCheck, FaBoxOpen, FaHandHoldingHeart, FaCheckCircle, FaClipboardList, FaComments, FaExclamationTriangle, FaStar, FaGift, FaSpinner, FaCircleNotch } from 'react-icons/fa'
import { Line, Bar } from 'react-chartjs-2'
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
} from 'chart.js'
import apiClient from '../services/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const StatCard = ({ icon, color, bg, value, label, loading }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon} style={{ background: bg, color }}>
      {icon}
    </div>
    <div className={styles.statInfo}>
      <h3>
        {loading ? (
          <FaCircleNotch style={{ animation: 'spin 1s linear infinite', fontSize: '1.2rem', color: '#94a3b8' }} />
        ) : (
          value ?? 0
        )}
      </h3>
      <p>{label}</p>
    </div>
  </div>
)

const Analytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalLostPosts: 0,
    totalFoundPosts: 0,
    recoveredItems: 0,
    claims: 0,
    messages: 0,
    reports: 0,
    ratings: 0,
    rewards: 0
  })
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [dashRes, analyticsRes] = await Promise.all([
          apiClient.get('/admin/dashboard').catch(e => {
             console.error("Dashboard stats failed", e);
             return { data: {} };
          }),
          apiClient.get('/admin/analytics').catch(e => {
             console.error("Analytics data failed", e);
             return { data: null };
          }),
        ])
        
        if (dashRes.data) {
          setStats(prev => ({ ...prev, ...dashRes.data }))
        }
        
        if (analyticsRes.data) {
          setAnalyticsData(analyticsRes.data)
        }
        
        if (!dashRes.data && !analyticsRes.data) {
           setError('Failed to load platform data. Please check your admin permissions.')
        }
      } catch (err) {
        console.error('Analytics fetch error:', err)
        setError(err.response?.data?.message || 'Failed to connect to analytics service.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const statItems = [
    { label: 'Total Users',       value: stats.totalUsers,      icon: <FaUsers />,                color: '#0ea5e9', bg: '#e0f2fe' },
    { label: 'Active Users',      value: stats.activeUsers,     icon: <FaUserCheck />,            color: '#10b981', bg: '#dcfce7' },
    { label: 'Total Lost Posts',  value: stats.totalLostPosts,  icon: <FaBoxOpen />,              color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Total Found Posts', value: stats.totalFoundPosts, icon: <FaHandHoldingHeart />,     color: '#8b5cf6', bg: '#ede9fe' },
    { label: 'Recovered Items',   value: stats.recoveredItems,  icon: <FaCheckCircle />,          color: '#10b981', bg: '#dcfce7' },
    { label: 'Claims',            value: stats.claims,          icon: <FaClipboardList />,        color: '#6366f1', bg: '#e0e7ff' },
    { label: 'Messages',          value: stats.messages,        icon: <FaComments />,             color: '#ec4899', bg: '#fce7f3' },
    { label: 'Reports',           value: stats.reports,         icon: <FaExclamationTriangle />,  color: '#ef4444', bg: '#fee2e2' },
    { label: 'Ratings',           value: stats.ratings,         icon: <FaStar />,                 color: '#fbbf24', bg: '#fef3c7' },
    { label: 'Rewards',           value: stats.rewards,         icon: <FaGift />,                 color: '#f43f5e', bg: '#fff1f2' },
  ]

  const lineData = (analyticsData && analyticsData.dailyUsers) ? {
    labels: analyticsData.dailyUsers.map(u => u.date || ''),
    datasets: [
      {
        label: 'New Registrations',
        data: analyticsData.dailyUsers.map(u => u.count || 0),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.4,
        fill: true,
      },
    ],
  } : null

  const barData = (analyticsData && analyticsData.postStats) ? {
    labels: ['Lost Posts', 'Found Posts', 'Recovered'],
    datasets: [
      {
        label: 'Items',
        data: [
          analyticsData.postStats.lost || 0,
          analyticsData.postStats.found || 0,
          analyticsData.postStats.recovered || 0,
        ],
        backgroundColor: ['#f59e0b', '#8b5cf6', '#10b981'],
        borderRadius: 8,
      },
    ],
  } : null

  const activityBarData = (analyticsData && analyticsData.activity) ? {
    labels: ['Messages', 'Claims', 'Rewards', 'Ratings'],
    datasets: [
      {
        label: 'Count',
        data: [
          analyticsData.activity.messages || 0,
          analyticsData.activity.claims || 0,
          analyticsData.activity.rewards || 0,
          analyticsData.activity.ratings || 0,
        ],
        backgroundColor: ['#ec4899', '#6366f1', '#f43f5e', '#fbbf24'],
        borderRadius: 8,
      },
    ],
  } : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'top',
        labels: { boxWidth: 12, usePointStyle: true, font: { size: 11 } }
      } 
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  }

  return (
    <div className={styles.dashboardPage}>
      <Sidebar />
      <main className={styles.mainContent}>
        <div className={styles.contentArea}>
          <div className={styles.sectionHeader}>
            <h2><FaChartBar /> Platform Analytics</h2>
            {loading && <FaSpinner className="spin" style={{ color: '#0ea5e9' }} />}
          </div>

          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '10px',
              padding: '16px', color: '#991b1b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <FaExclamationTriangle /> {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className={styles.statsRow} style={{ flexWrap: 'wrap', gap: '20px' }}>
            {statItems.map((item, i) => (
              <StatCard key={i} {...item} loading={loading && !stats.totalUsers} />
            ))}
          </div>

          {/* Charts */}
          {loading && !analyticsData ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>
              <FaCircleNotch style={{ fontSize: '3rem', animation: 'spin 1s linear infinite', opacity: 0.2 }} />
              <p style={{ marginTop: '16px', fontWeight: 500 }}>Gathering platform data...</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              {(lineData || barData) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '24px' }}>
                  {lineData && (
                    <div className={styles.statCard} style={{ display: 'block', padding: '24px' }}>
                      <h4 style={{ marginTop: 0, marginBottom: '20px', color: '#1e293b', fontSize: '1rem' }}>User Growth (30D)</h4>
                      <div style={{ height: '300px' }}>
                        <Line data={lineData} options={chartOptions} />
                      </div>
                    </div>
                  )}
                  {barData && (
                    <div className={styles.statCard} style={{ display: 'block', padding: '24px' }}>
                      <h4 style={{ marginTop: 0, marginBottom: '20px', color: '#1e293b', fontSize: '1rem' }}>Post Distribution</h4>
                      <div style={{ height: '300px' }}>
                        <Bar data={barData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activityBarData && (
                <div className={styles.statCard} style={{ display: 'block', padding: '24px', marginTop: '24px' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '20px', color: '#1e293b', fontSize: '1rem' }}>Platform Activity Overview</h4>
                  <div style={{ height: '320px' }}>
                    <Bar
                      data={activityBarData}
                      options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Analytics
