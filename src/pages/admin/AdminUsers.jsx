import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import adminService from '../../services/adminService'
import Swal from 'sweetalert2'

const AdminUsers = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        try {
            const response = await adminService.getUsers()
            setUsers(response.data.users)
        } catch (err) {
            console.error('Failed to fetch users:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleBan = async (userId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You want to ban this user!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, ban them!'
        })

        if (result.isConfirmed) {
            try {
                await adminService.banUser(userId)
                Swal.fire('Banned!', 'User has been banned.', 'success')
                fetchUsers()
            } catch (err) {
                Swal.fire('Error', 'Failed to ban user.', 'error')
            }
        }
    }

    const handleUnban = async (userId) => {
        try {
            await adminService.unbanUser(userId)
            Swal.fire('Unbanned!', 'User access restored.', 'success')
            fetchUsers()
        } catch (err) {
            Swal.fire('Error', 'Failed to unban user.', 'error')
        }
    }

    const handlePromote = async (userId) => {
        try {
            await adminService.promoteUser(userId)
            Swal.fire('Promoted!', 'User is now an admin.', 'success')
            fetchUsers()
        } catch (err) {
            Swal.fire('Error', 'Failed to promote user.', 'error')
        }
    }

    const handleDemote = async (userId) => {
        try {
            await adminService.demoteUser(userId)
            Swal.fire('Demoted!', 'User role updated to normal user.', 'success')
            fetchUsers()
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to demote user.'
            Swal.fire('Error', msg, 'error')
        }
    }

    if (loading) return <AdminLayout title="User Management"><div>Loading...</div></AdminLayout>

    return (
        <AdminLayout title="User Management">
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Join Date</th>
                            <th>Posts</th>
                            <th>Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td style={{ fontWeight: '800', color: 'var(--primary)' }}>#{user.id}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', border: '2px solid var(--border-color)', borderRadius: '50%', background: 'var(--bg-card-alt)', overflow: 'hidden' }}>
                                            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=00A9B5&color=fff`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <span style={{ fontWeight: '600' }}>{user.name}</span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`badge badge-${user.role}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge badge-${user.status}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td>{new Date(user.join_date).toLocaleDateString()}</td>
                                <td style={{ textAlign: 'center' }}>{user.posts_count}</td>
                                <td style={{ textAlign: 'center' }}>{user.avg_rating ? parseFloat(user.avg_rating).toFixed(1) : '-'}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {user.status === 'active' ? (
                                            <button onClick={() => handleBan(user.id)} className="btn-action btn-ban">Ban</button>
                                        ) : (
                                            <button onClick={() => handleUnban(user.id)} className="btn-action btn-unban">Unban</button>
                                        )}
                                        
                                        {user.role === 'user' ? (
                                            <button onClick={() => handlePromote(user.id)} className="btn-action btn-promote">Assign Admin</button>
                                        ) : (
                                            <button onClick={() => handleDemote(user.id)} className="btn-action btn-ban" style={{ background: '#fef3c7', color: '#92400e' }}>Remove Admin</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    )
}

export default AdminUsers
