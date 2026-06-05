import React from 'react'
import AdminLayout from './AdminLayout'
import { FaSave } from 'react-icons/fa'

const AdminSettings = () => {
    return (
        <AdminLayout title="System Settings">
            <div className="admin-card">
                <h3 style={{ marginTop: 0 }}>General Settings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>Site Name</label>
                        <input type="text" defaultValue="Lost & Found Platform" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>Admin Email Notifications</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" defaultChecked />
                            <span>Notify on new reports</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <input type="checkbox" defaultChecked />
                            <span>Notify on new user registrations</span>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>Maintenance Mode</label>
                        <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <option value="off">Off (Site Live)</option>
                            <option value="on">On (Under Maintenance)</option>
                        </select>
                    </div>
                    <button className="btn-action" style={{ background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <FaSave /> Save Changes
                    </button>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminSettings
