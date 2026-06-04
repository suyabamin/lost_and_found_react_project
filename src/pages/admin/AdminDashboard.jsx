import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { FaChartBar, FaUsers, FaBoxOpen, FaClipboardCheck, FaHandHoldingHeart, FaStar, FaMoneyBillWave } from 'react-icons/fa'
import apiClient from '../../services/api'

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        posts: 0,
        claims: 0,
        returns: 0,
        avg_rating: 0,
        total_rewards: 0
    })

    useEffect(() => {
        apiClient.get('/admin/stats').then(res => setStats(res.data))
    }, [])

    return (
        <AdminLayout title="Admin Overview">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#e0f2fe', color: '#0ea5e9', padding: '1rem', borderRadius: '12px' }}><FaUsers size={20} /></div>
                    <div>
                        <h4 style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>Total Users</h4>
                        <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{stats.users}</p>
                    </div>
                </div>
                <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#fef3c7', color: '#f59e0b', padding: '1rem', borderRadius: '12px' }}><FaBoxOpen size={20} /></div>
                    <div>
                        <h4 style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>Active Posts</h4>
                        <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{stats.posts}</p>
                    </div>
                </div>
                <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#dcfce7', color: '#10b981', padding: '1rem', borderRadius: '12px' }}><FaHandHoldingHeart size={20} /></div>
                    <div>
                        <h4 style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>Completed Returns</h4>
                        <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{stats.returns}</p>
                    </div>
                </div>
                <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: '12px' }}><FaStar size={20} /></div>
                    <div>
                        <h4 style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>Avg Rating</h4>
                        <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{stats.avg_rating || 'N/A'}</p>
                    </div>
                </div>
                <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#ede9fe', color: '#8b5cf6', padding: '1rem', borderRadius: '12px' }}><FaMoneyBillWave size={20} /></div>
                    <div>
                        <h4 style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>Rewards Sent</h4>
                        <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{stats.total_rewards} BDT</p>
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <h3 style={{ marginBottom: '1rem' }}>Recent Platform Activity</h3>
                <p style={{ color: '#64748b' }}>The platform is performing well with {stats.returns} successful item recoveries to date.</p>
            </div>
        </AdminLayout>
    )
}

export default AdminDashboard;
