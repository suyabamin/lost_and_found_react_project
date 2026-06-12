import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import adminService from '../../services/adminService'
import { FaCrown, FaUserGraduate, FaHandshake, FaMoneyBillWave, FaStar } from 'react-icons/fa'

const AdminStats = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true)
            try {
                const response = await adminService.getStats()
                setStats(response.data)
            } catch (err) {
                console.error('Failed to fetch admin stats:', err)
                setError('Failed to load system statistics.')
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) return <AdminLayout title="Admin Stats"><div style={{ padding: '40px', textAlign: 'center' }}>Loading system statistics...</div></AdminLayout>
    
    if (error) return <AdminLayout title="Admin Stats"><div style={{ padding: '40px', color: '#ef4444' }}>⚠️ {error}</div></AdminLayout>

    return (
        <AdminLayout title="System Statistics">
            <div className="grid-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#6366f1', background: '#e0e7ff' }}><FaUserGraduate /></div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Total Admins</p>
                        <h3 style={{ margin: 0 }}>{stats?.totalAdmins || 0}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#10b981', background: '#dcfce7' }}><FaHandshake /></div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Completed Returns</p>
                        <h3 style={{ margin: 0 }}>{stats?.completedReturns || 0}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#f59e0b', background: '#fef3c7' }}><FaMoneyBillWave /></div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Total Reward Payout</p>
                        <h3 style={{ margin: 0 }}>${stats?.totalRewardAmount?.toLocaleString() || '0'}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#fbbf24', background: '#fef3c7' }}><FaStar /></div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Average Rating</p>
                        <h3 style={{ margin: 0 }}>{stats?.averageRating?.toFixed(1) || '0.0'} / 5.0</h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                <div className="admin-card">
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaCrown style={{ color: '#fbbf24' }} /> Top Finders
                    </h3>
                    <div className="admin-table-wrapper" style={{ boxShadow: 'none', border: '1px solid #f1f5f9' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Items Returned</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.topFinders?.map((f, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>{f.name}</td>
                                        <td>{f.found_count} items</td>
                                    </tr>
                                )) || <tr><td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>No data available</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="admin-card">
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Top Contributors</h3>
                    <div className="admin-table-wrapper" style={{ boxShadow: 'none', border: '1px solid #f1f5f9' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Total Posts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.topContributors?.map((c, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                                        <td>{c.post_count} posts</td>
                                    </tr>
                                )) || <tr><td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>No data available</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminStats
