import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import axios from 'axios'
import Swal from 'sweetalert2'

const AdminModeration = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/moderation', { withCredentials: true })
            setData(response.data)
        } catch (err) {
            console.error('Failed to fetch moderation data:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handlePostAction = async (postId, action) => {
        try {
            await axios.post(`http://127.0.0.1:8000/api/admin/posts/${postId}/action`, { action }, { withCredentials: true })
            Swal.fire('Success', `Post ${action}ed successfully.`, 'success')
            fetchData()
        } catch (err) {
            Swal.fire('Error', 'Failed to perform action.', 'error')
        }
    }

    if (loading) return <AdminLayout title="Moderation"><div>Loading...</div></AdminLayout>

    return (
        <AdminLayout title="Moderation Center">
            <div style={{ display: 'grid', gap: '2rem' }}>
                <section className="admin-card">
                    <h3 style={{ marginTop: 0 }}>Pending Claims Verification</h3>
                    <div className="admin-table-wrapper" style={{ boxShadow: 'none', marginTop: '1rem', border: '1px solid #f1f5f9' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Claimant</th>
                                    <th>Proof</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.pendingClaims.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No pending claims.</td></tr>}
                                {data?.pendingClaims.map(claim => (
                                    <tr key={claim.id}>
                                        <td style={{ fontWeight: 600 }}>{claim.item_title}</td>
                                        <td>{claim.claimant_name}</td>
                                        <td><button onClick={() => Swal.fire('Proof Details', claim.description, 'info')} className="btn-action" style={{ background: '#eef2ff', color: '#4f46e5' }}>View Details</button></td>
                                        <td>{new Date(claim.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn-action btn-unban" style={{ padding: '0.25rem 0.75rem' }}>Approve</button>
                                                <button className="btn-action btn-ban" style={{ padding: '0.25rem 0.75rem' }}>Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <section className="admin-card">
                        <h3 style={{ marginTop: 0 }}>Reported Users</h3>
                        <div className="admin-table-wrapper" style={{ boxShadow: 'none', border: '1px solid #f1f5f9' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Reporter</th>
                                        <th>Reason</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.reportedUsers.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No reports.</td></tr>}
                                    {data?.reportedUsers.map(r => (
                                        <tr key={r.id}>
                                            <td style={{ fontWeight: 600 }}>{r.reported_name}</td>
                                            <td>{r.reporter_name}</td>
                                            <td>{r.reason}</td>
                                            <td>
                                                <button className="btn-action btn-ban" style={{ padding: '0.25rem 0.5rem' }}>Review</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="admin-card">
                        <h3 style={{ marginTop: 0 }}>Reported Posts</h3>
                        <div className="admin-table-wrapper" style={{ boxShadow: 'none', border: '1px solid #f1f5f9' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Post</th>
                                        <th>Reporter</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.reportedPosts.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>No reports.</td></tr>}
                                    {data?.reportedPosts.map(r => (
                                        <tr key={r.id}>
                                            <td style={{ fontWeight: 600 }}>{r.item_title}</td>
                                            <td>{r.reporter_name}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    <button onClick={() => handlePostAction(r.reported_id, 'hide')} className="btn-action" style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.5rem' }}>Hide</button>
                                                    <button onClick={() => handlePostAction(r.reported_id, 'delete')} className="btn-action btn-ban" style={{ padding: '0.25rem 0.5rem' }}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminModeration
