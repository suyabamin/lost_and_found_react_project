import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import axios from 'axios'
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/admin/analytics', { withCredentials: true })
                setData(response.data)
            } catch (err) {
                console.error('Failed to fetch analytics:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return <AdminLayout title="Analytics"><div>Loading...</div></AdminLayout>

    const userChartData = {
        labels: data?.dailyUsers.map(u => u.date),
        datasets: [
            {
                label: 'New Registrations',
                data: data?.dailyUsers.map(u => u.count),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                tension: 0.4
            }
        ]
    }

    const postChartData = {
        labels: ['Lost Posts', 'Found Posts', 'Recovered Items'],
        datasets: [
            {
                label: 'Count',
                data: [data?.postStats.lost, data?.postStats.found, data?.postStats.recovered],
                backgroundColor: ['#f59e0b', '#8b5cf6', '#10b981'],
            }
        ]
    }

    const activityData = {
        labels: ['Messages', 'Claims', 'Rewards', 'Ratings'],
        datasets: [
            {
                label: 'Total Count',
                data: [data?.activity.messages, data?.activity.claims, data?.activity.rewards, data?.activity.ratings],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1,
            }
        ]
    }

    return (
        <AdminLayout title="Growth Analytics">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="admin-card">
                    <h3 style={{ marginTop: 0, marginBottom: '2rem' }}>User Growth (Last 30 Days)</h3>
                    <Line data={userChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </div>
                <div className="admin-card">
                    <h3 style={{ marginTop: 0, marginBottom: '2rem' }}>Post Distribution</h3>
                    <Pie data={postChartData} options={{ responsive: true }} />
                </div>
            </div>

            <div className="admin-card">
                <h3 style={{ marginTop: 0, marginBottom: '2rem' }}>Platform Activity Overview</h3>
                <div style={{ height: '300px' }}>
                    <Bar data={activityData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminAnalytics
