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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
            <Header />
            <div style={{ flex: 1, display: 'flex', padding: '32px 40px', gap: '32px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
                {/* Sidebar */}
                <aside style={{ width: '300px', background: 'white', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', height: 'fit-content', position: 'sticky', top: '100px' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-heading)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '24px', opacity: 0.7 }}>Platform Controls</h3>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: isActive('/admin') ? 'white' : 'var(--text-body)', background: isActive('/admin') ? 'var(--primary)' : 'transparent', fontWeight: '600', transition: 'var(--transition)', boxShadow: isActive('/admin') ? '0 4px 12px rgba(0, 169, 181, 0.2)' : 'none' }}>
                            <FaTachometerAlt /> Dashboard
                        </Link>
                        <Link to="/admin/moderation" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: isActive('/admin/moderation') ? 'white' : 'var(--text-body)', background: isActive('/admin/moderation') ? 'var(--primary)' : 'transparent', fontWeight: '600', transition: 'var(--transition)', boxShadow: isActive('/admin/moderation') ? '0 4px 12px rgba(0, 169, 181, 0.2)' : 'none' }}>
                            <FaShieldAlt /> Moderation
                        </Link>
                        <Link to="/admin/analytics" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: isActive('/admin/analytics') ? 'white' : 'var(--text-body)', background: isActive('/admin/analytics') ? 'var(--primary)' : 'transparent', fontWeight: '600', transition: 'var(--transition)', boxShadow: isActive('/admin/analytics') ? '0 4px 12px rgba(0, 169, 181, 0.2)' : 'none' }}>
                            <FaChartLine /> Analytics
                        </Link>
                        <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: isActive('/admin/users') ? 'white' : 'var(--text-body)', background: isActive('/admin/users') ? 'var(--primary)' : 'transparent', fontWeight: '600', transition: 'var(--transition)', boxShadow: isActive('/admin/users') ? '0 4px 12px rgba(0, 169, 181, 0.2)' : 'none' }}>
                            <FaUsers /> User Management
                        </Link>
                        <Link to="/admin/reports" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: isActive('/admin/reports') ? 'white' : 'var(--text-body)', background: isActive('/admin/reports') ? 'var(--primary)' : 'transparent', fontWeight: '600', transition: 'var(--transition)', boxShadow: isActive('/admin/reports') ? '0 4px 12px rgba(0, 169, 181, 0.2)' : 'none' }}>
                            <FaExclamationTriangle /> Reports
                        </Link>
                        <Link to="/admin/stats" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: isActive('/admin/stats') ? 'white' : 'var(--text-body)', background: isActive('/admin/stats') ? 'var(--primary)' : 'transparent', fontWeight: '600', transition: 'var(--transition)', boxShadow: isActive('/admin/stats') ? '0 4px 12px rgba(0, 169, 181, 0.2)' : 'none' }}>
                            <FaChartBar /> Admin Stats
                        </Link>
                        <Link to="/admin/logs" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: isActive('/admin/logs') ? 'white' : 'var(--text-body)', background: isActive('/admin/logs') ? 'var(--primary)' : 'transparent', fontWeight: '600', transition: 'var(--transition)', boxShadow: isActive('/admin/logs') ? '0 4px 12px rgba(0, 169, 181, 0.2)' : 'none' }}>
                            <FaHistory /> System Logs
                        </Link>
                        <Link to="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: isActive('/admin/settings') ? 'white' : 'var(--text-body)', background: isActive('/admin/settings') ? 'var(--primary)' : 'transparent', fontWeight: '600', transition: 'var(--transition)', boxShadow: isActive('/admin/settings') ? '0 4px 12px rgba(0, 169, 181, 0.2)' : 'none' }}>
                            <FaCog /> Settings
                        </Link>
                    </nav>
                </aside>

                {/* Content */}
                <main style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.03em' }}>{title}</h2>
                    </div>
                    {children}
                </main>
            </div>
            <Footer />

            <style>{`
                .admin-card { background: white; border-radius: var(--radius-xl); padding: 32px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); }
                .grid-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; margin-bottom: 32px; }
                .stat-card { background: white; border-radius: var(--radius-xl); padding: 24px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 16px; transition: var(--transition); }
                .stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--primary); }
                .stat-icon { width: 56px; height: 56px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
                .admin-table-wrapper { background: white; border-radius: var(--radius-xl); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); overflow: hidden; margin-top: 24px; }
                .admin-table { width: 100%; border-collapse: collapse; }
                .admin-table th { text-align: left; padding: 20px 24px; border-bottom: 2px solid var(--bg-main); color: var(--text-body); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; }
                .admin-table td { padding: 20px 24px; border-bottom: 1px solid var(--bg-main); vertical-align: middle; color: var(--text-heading); font-size: 0.95rem; }
                .badge { padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
                .badge-user { background: #e0f2fe; color: #0369a1; }
                .badge-admin { background: #fef3c7; color: #92400e; }
                .badge-active { background: #dcfce7; color: #166534; }
                .badge-banned { background: #fee2e2; color: #991b1b; }
                .btn-action { padding: 10px 18px; border-radius: var(--radius-md); font-weight: 700; font-size: 0.85rem; cursor: pointer; border: none; transition: var(--transition); }
                .btn-ban { background: #fee2e2; color: #b91c1c; }
                .btn-ban:hover { background: #fecaca; transform: scale(1.05); }
                .btn-unban { background: #dcfce7; color: #15803d; }
                .btn-unban:hover { background: #bbf7d0; transform: scale(1.05); }
                .btn-promote { background: var(--primary-light); color: var(--primary); }
                .btn-promote:hover { background: var(--primary); color: white; transform: scale(1.05); }
            `}</style>
        </div>
    )
}

export default AdminLayout;
