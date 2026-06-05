import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import axios from 'axios'
import { FaCrown, FaUserGraduate, FaHandshake, FaMoneyBillWave, FaStar } from 'react-icons/fa'

const AdminStats = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/admin/stats', { withCredentials: true })
                setStats(response.data)
            } catch (err) {
                console.error('Failed to fetch admin stats:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) return <AdminLayout title="Admin Stats"><div>Loading...</div></AdminLayout>

    return (
        <AdminLayout title="System Statistics">
            <div className="grid-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#6366f1', background: '#e0e7ff' }}><FaUserGraduate /></div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Total Admins</p>
                        <h3 style={{ margin: 0 }}>{stats?.totalAdmins}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#10b981', background: '#dcfce7' }}><FaHandshake /></div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Completed Returns</p>
                        <h3 style={{ margin: 0 }}>{stats?.completedReturns}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#f59e0b', background: '#fef3c7' }}><FaMoneyBillWave /></div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Total Reward Payout</p>
                        <h3 style={{ margin: 0 }}>${stats?.totalRewardAmount?.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#fbbf24', background: '#fef3c7' }}><FaStar /></div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Average Rating</p>
                        <h3 style={{ margin: 0 }}>{stats?.averageRating?.toFixed(1)} / 5.0</h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
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
                                {stats?.topFinders.map((f, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>{f.name}</td>
                                        <td>{f.found_count} items</td>
                                    </tr>
                                ))}
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
                                {stats?.topContributors.map((c, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                                        <td>{c.post_count} posts</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminStats
