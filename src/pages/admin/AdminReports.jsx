import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import adminService from '../../services/adminService'
import Swal from 'sweetalert2'

const AdminReports = () => {
    const [reports, setReports] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await adminService.getReports()
                setReports(response.data)
            } catch (err) {
                console.error('Failed to fetch reports:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchReports()
    }, [])

    if (loading) return <AdminLayout title="Reports"><div>Loading...</div></AdminLayout>

    return (
        <AdminLayout title="Report Management">
            <div style={{ display: 'grid', gap: '2rem' }}>
                <div className="admin-card">
                    <h3 style={{ marginTop: 0 }}>All System Reports</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <span className="badge badge-active" style={{ cursor: 'pointer' }}>Active</span>
                        <span className="badge" style={{ background: '#f1f5f9', color: '#64748b', cursor: 'pointer' }}>Archived</span>
                    </div>

                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Subject</th>
                                    <th>Reporter</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports?.userReports.map(r => (
                                    <tr key={`user-${r.id}`}>
                                        <td><span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>USER</span></td>
                                        <td>{r.reported_name}</td>
                                        <td>{r.reporter_name}</td>
                                        <td>{new Date(r.created_at).toLocaleDateString()}</td>
                                        <td><span className="badge badge-pending">Pending</span></td>
                                        <td><button className="btn-action" style={{ background: '#f1f5f9' }}>Manage</button></td>
                                    </tr>
                                ))}
                                {reports?.postReports.map(r => (
                                    <tr key={`post-${r.id}`}>
                                        <td><span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>POST</span></td>
                                        <td>{r.item_title}</td>
                                        <td>{r.reporter_name}</td>
                                        <td>{new Date(r.created_at).toLocaleDateString()}</td>
                                        <td><span className="badge badge-pending">Pending</span></td>
                                        <td><button className="btn-action" style={{ background: '#f1f5f9' }}>Manage</button></td>
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

export default AdminReports
