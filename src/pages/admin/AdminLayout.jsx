import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Link, useLocation } from 'react-router-dom'
import { 
    FaTachometerAlt, FaUsers, FaBoxOpen, FaClipboardCheck, 
    FaExclamationTriangle, FaChartLine, FaShieldAlt, FaHistory, FaCog, FaChartBar
} from 'react-icons/fa'

const AdminLayout = ({ children, title }) => {
    const location = useLocation()
    const isActive = (path) => location.pathname === path

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            <Header />
            <div style={{ flex: 1, display: 'flex', padding: '2rem', gap: '2rem', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
                {/* Sidebar */}
                <aside style={{ width: '280px', background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: 'fit-content', position: 'sticky', top: '100px' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Admin Panel</h3>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none', color: isActive('/admin') ? '#00cfe8' : '#64748b', background: isActive('/admin') ? '#f0fdfa' : 'transparent', fontWeight: '600' }}>
                            <FaTachometerAlt /> Dashboard
                        </Link>
                        <Link to="/admin/moderation" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none', color: isActive('/admin/moderation') ? '#00cfe8' : '#64748b', background: isActive('/admin/moderation') ? '#f0fdfa' : 'transparent', fontWeight: '600' }}>
                            <FaShieldAlt /> Moderation
                        </Link>
                        <Link to="/admin/analytics" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none', color: isActive('/admin/analytics') ? '#00cfe8' : '#64748b', background: isActive('/admin/analytics') ? '#f0fdfa' : 'transparent', fontWeight: '600' }}>
                            <FaChartLine /> Analytics
                        </Link>
                        <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none', color: isActive('/admin/users') ? '#00cfe8' : '#64748b', background: isActive('/admin/users') ? '#f0fdfa' : 'transparent', fontWeight: '600' }}>
                            <FaUsers /> User Management
                        </Link>
                        <Link to="/admin/reports" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none', color: isActive('/admin/reports') ? '#00cfe8' : '#64748b', background: isActive('/admin/reports') ? '#f0fdfa' : 'transparent', fontWeight: '600' }}>
                            <FaExclamationTriangle /> Reports
                        </Link>
                        <Link to="/admin/stats" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none', color: isActive('/admin/stats') ? '#00cfe8' : '#64748b', background: isActive('/admin/stats') ? '#f0fdfa' : 'transparent', fontWeight: '600' }}>
                            <FaChartBar /> Admin Stats
                        </Link>
                        <Link to="/admin/logs" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none', color: isActive('/admin/logs') ? '#00cfe8' : '#64748b', background: isActive('/admin/logs') ? '#f0fdfa' : 'transparent', fontWeight: '600' }}>
                            <FaHistory /> System Logs
                        </Link>
                        <Link to="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none', color: isActive('/admin/settings') ? '#00cfe8' : '#64748b', background: isActive('/admin/settings') ? '#f0fdfa' : 'transparent', fontWeight: '600' }}>
                            <FaCog /> Settings
                        </Link>
                    </nav>
                </aside>

                {/* Content */}
                <main style={{ flex: 1 }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b' }}>{title}</h2>
                    </div>
                    {children}
                </main>
            </div>
            <Footer />

            <style>{`
                .admin-card { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
                .grid-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                .stat-card { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: flex; align-items: center; gap: 1rem; }
                .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
                .admin-table-wrapper { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); overflow: hidden; margin-top: 1.5rem; }
                .admin-table { width: 100%; border-collapse: collapse; }
                .admin-table th { text-align: left; padding: 1.25rem 1.5rem; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
                .admin-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; color: #475569; font-size: 0.875rem; }
                .badge { padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
                .badge-user { background: #e0f2fe; color: #0369a1; }
                .badge-admin { background: #fef3c7; color: #92400e; }
                .badge-active { background: #dcfce7; color: #166534; }
                .badge-banned { background: #fee2e2; color: #991b1b; }
                .btn-action { padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.875rem; cursor: pointer; border: none; transition: all 0.2s; }
                .btn-ban { background: #fee2e2; color: #b91c1c; }
                .btn-ban:hover { background: #fecaca; }
                .btn-unban { background: #dcfce7; color: #15803d; }
                .btn-unban:hover { background: #bbf7d0; }
                .btn-promote { background: #f0fdfa; color: #0f766e; }
                .btn-promote:hover { background: #ccfbf1; }
            `}</style>
        </div>
    )
}

export default AdminLayout;
