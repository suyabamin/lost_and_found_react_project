import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Link, useLocation } from 'react-router-dom'
import { FaTachometerAlt, FaUsers, FaBoxOpen, FaClipboardCheck, FaExclamationTriangle } from 'react-icons/fa'

const AdminLayout = ({ children, title }) => {
    const location = useLocation()
    const isActive = (path) => location.pathname === path

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            <Header />
            <div style={{ flex: 1, display: 'flex', padding: '2rem', gap: '2rem', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
                {/* Sidebar */}
                <aside style={{ width: '260px', background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Menu</h3>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none', color: isActive('/admin') ? '#00cfe8' : '#1e293b', background: isActive('/admin') ? '#f0fdfa' : 'transparent', fontWeight: '600' }}>
                            <FaTachometerAlt /> Dashboard
                        </Link>
                        <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none', color: isActive('/admin/users') ? '#00cfe8' : '#1e293b', background: isActive('/admin/users') ? '#f0fdfa' : 'transparent', fontWeight: '600' }}>
                            <FaUsers /> Users
                        </Link>
                        <Link to="/admin/posts" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none', color: isActive('/admin/posts') ? '#00cfe8' : '#1e293b', background: isActive('/admin/posts') ? '#f0fdfa' : 'transparent', fontWeight: '600' }}>
                            <FaBoxOpen /> Posts
                        </Link>
                        <Link to="/admin/claims" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none', color: isActive('/admin/claims') ? '#00cfe8' : '#1e293b', background: isActive('/admin/claims') ? '#f0fdfa' : 'transparent', fontWeight: '600' }}>
                            <FaClipboardCheck /> Claims
                        </Link>
                        <Link to="/admin/reports" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', textDecoration: 'none', color: isActive('/admin/reports') ? '#00cfe8' : '#1e293b', background: isActive('/admin/reports') ? '#f0fdfa' : 'transparent', fontWeight: '600' }}>
                            <FaExclamationTriangle /> Reports
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
                .admin-table { width: 100%; border-collapse: collapse; }
                .admin-table th { text-align: left; padding: 1rem; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 0.875rem; text-transform: uppercase; }
                .admin-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
                .badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
                .badge-pending { background: #fef9c3; color: #854d0e; }
                .badge-approved { background: #dcfce7; color: #166534; }
                .badge-rejected { background: #fee2e2; color: #991b1b; }
                .btn-icon { width: 32px; height: 32px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-right: 0.5rem; transition: all 0.2s; }
                .btn-icon:hover { border-color: #00cfe8; color: #00cfe8; }
                .btn-icon.success:hover { background: #dcfce7; border-color: #166534; color: #166534; }
                .btn-icon.danger:hover { background: #fee2e2; border-color: #991b1b; color: #991b1b; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

export default AdminLayout;
