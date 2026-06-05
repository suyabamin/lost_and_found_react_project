import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import axios from 'axios'
import { 
    FaUsers, FaUserCheck, FaBoxOpen, FaHandHoldingHeart, 
    FaCheckCircle, FaClipboardList, FaComments, FaExclamationTriangle, 
    FaStar, FaGift 
} from 'react-icons/fa'

const AdminDashboard = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/admin/dashboard', {
                    withCredentials: true
                })
                setStats(response.data)
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) return <AdminLayout title="Dashboard"><div>Loading...</div></AdminLayout>

    const statItems = [
        { title: 'Total Users', value: stats?.totalUsers, icon: <FaUsers />, color: '#0ea5e9', bg: '#e0f2fe' },
        { title: 'Active Users', value: stats?.activeUsers, icon: <FaUserCheck />, color: '#10b981', bg: '#dcfce7' },
        { title: 'Total Lost Posts', value: stats?.totalLostPosts, icon: <FaBoxOpen />, color: '#f59e0b', bg: '#fef3c7' },
        { title: 'Total Found Posts', value: stats?.totalFoundPosts, icon: <FaHandHoldingHeart />, color: '#8b5cf6', bg: '#ede9fe' },
        { title: 'Recovered Items', value: stats?.recoveredItems, icon: <FaCheckCircle />, color: '#10b981', bg: '#dcfce7' },
        { title: 'Claims', value: stats?.claims, icon: <FaClipboardList />, color: '#6366f1', bg: '#e0e7ff' },
        { title: 'Messages', value: stats?.messages, icon: <FaComments />, color: '#ec4899', bg: '#fce7f3' },
        { title: 'Reports', value: stats?.reports, icon: <FaExclamationTriangle />, color: '#ef4444', bg: '#fee2e2' },
        { title: 'Ratings', value: stats?.ratings, icon: <FaStar />, color: '#fbbf24', bg: '#fef3c7' },
        { title: 'Rewards', value: stats?.rewards, icon: <FaGift />, color: '#f43f5e', bg: '#fff1f2' },
    ]

    return (
        <AdminLayout title="Admin Dashboard">
            <div className="grid-stats">
                {statItems.map((item, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon" style={{ color: item.color, background: item.bg }}>
                            {item.icon}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', fontWeight: '600' }}>{item.title}</p>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{item.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="admin-card">
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6366f1' }}></div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600' }}>New user joined the platform</p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>2 minutes ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-card">
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>System Health</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Server Load</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>24%</span>
                            </div>
                            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#10b981', width: '24%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Database Storage</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>42%</span>
                            </div>
                            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#f59e0b', width: '42%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>API Response Time</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>120ms</span>
                            </div>
                            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#6366f1', width: '15%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminDashboard
