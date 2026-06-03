import AdminLayout from './AdminLayout'
import { FaChartBar, FaUsers, FaBoxOpen, FaClipboardCheck } from 'react-icons/fa'

const AdminDashboard = () => (
    <AdminLayout title="Admin Overview">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#e0f2fe', color: '#0ea5e9', padding: '1rem', borderRadius: '12px' }}><FaUsers size={24} /></div>
                <div>
                    <h4 style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Users</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800' }}>42</p>
                </div>
            </div>
            <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#fef3c7', color: '#f59e0b', padding: '1rem', borderRadius: '12px' }}><FaBoxOpen size={24} /></div>
                <div>
                    <h4 style={{ color: '#64748b', fontSize: '0.875rem' }}>Active Posts</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800' }}>128</p>
                </div>
            </div>
            <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#dcfce7', color: '#10b981', padding: '1rem', borderRadius: '12px' }}><FaClipboardCheck size={24} /></div>
                <div>
                    <h4 style={{ color: '#64748b', fontSize: '0.875rem' }}>Pending Claims</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800' }}>12</p>
                </div>
            </div>
        </div>

        <div className="admin-card">
            <h3 style={{ marginBottom: '1rem' }}>Recent Platform Activity</h3>
            <p style={{ color: '#64748b' }}>Select a category from the sidebar to manage platform data.</p>
        </div>
    </AdminLayout>
)

export default AdminDashboard;
