import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import apiClient from '../../services/api'
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
  ArcElement
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

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

const AdminAnalytics = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await apiClient.get('/admin/analytics')
                setData(response.data)
            } catch (err) {
                console.error('Failed to fetch analytics:', err)
                setError('Failed to load analytics data.')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <AdminLayout title="Analytics"><div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading analytics...</div></AdminLayout>
    
    if (error) return <AdminLayout title="Analytics"><div style={{ padding: '40px', color: '#ef4444' }}>⚠️ {error}</div></AdminLayout>

    const userChartData = {
        labels: data?.dailyUsers?.map(u => u.date) || [],
        datasets: [
            {
                label: 'New Registrations',
                data: data?.dailyUsers?.map(u => u.count) || [],
                borderColor: 'var(--primary)',
                backgroundColor: 'var(--primary-light)',
                fill: true,
                tension: 0.4
            }
        ]
    }

    const postChartData = {
        labels: ['Lost Posts', 'Found Posts', 'Recovered Items'],
        datasets: [
            {
                label: 'Count',
                data: [data?.postStats?.lost || 0, data?.postStats?.found || 0, data?.postStats?.recovered || 0],
                backgroundColor: ['#f43f5e', 'var(--primary)', '#10b981'],
                borderWidth: 0
            }
        ]
    }

    const activityData = {
        labels: ['Messages', 'Claims', 'Rewards', 'Ratings'],
        datasets: [
            {
                label: 'Total Count',
                data: [
                    data?.activity?.messages || 0, 
                    data?.activity?.claims || 0, 
                    data?.activity?.rewards || 0, 
                    data?.activity?.ratings || 0
                ],
                backgroundColor: [
                    'rgba(0, 169, 181, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(16, 185, 129, 0.7)'
                ],
                borderRadius: 8
            }
        ]
    }

    return (
        <AdminLayout title="Growth Analytics">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className="admin-card">
                    <h3 style={{ marginTop: 0, marginBottom: '2rem' }}>User Growth (30 Days)</h3>
                    <Line data={userChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </div>
                <div className="admin-card">
                    <h3 style={{ marginTop: 0, marginBottom: '2rem' }}>Post Distribution</h3>
                    <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                        <Pie data={postChartData} options={{ responsive: true }} />
                    </div>
                </div>
            </div>

            <div className="admin-card" style={{ marginTop: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '2rem' }}>Platform Activity Overview</h3>
                <div style={{ height: '300px' }}>
                    <Bar data={activityData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminAnalytics
