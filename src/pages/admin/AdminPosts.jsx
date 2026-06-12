import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import adminService from '../../services/adminService'
import Swal from 'sweetalert2'

const AdminPosts = () => {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchPosts = async () => {
        try {
            const response = await adminService.getPosts()
            setPosts(response.data.posts)
        } catch (err) {
            console.error('Failed to fetch posts:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    const handleAction = async (postId, action) => {
        try {
            await adminService.postAction(postId, action)
            Swal.fire('Success', `Post ${action}ed successfully.`, 'success')
            fetchPosts()
        } catch (err) {
            Swal.fire('Error', `Failed to ${action} post.`, 'error')
        }
    }

    if (loading) return <AdminLayout title="Post Moderation"><div>Loading...</div></AdminLayout>

    return (
        <AdminLayout title="Manage Posts">
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Posted By</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(post => (
                            <tr key={post.id}>
                                <td>
                                    <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card-alt)', overflow: 'hidden' }}>
                                        <img src={post.image_url || 'https://via.placeholder.com/56'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </td>
                                <td style={{ fontWeight: 800, color: 'var(--text-heading)' }}>{post.title}</td>
                                <td>
                                    <span className={`badge ${post.type === 'lost' ? 'badge-banned' : 'badge-active'}`}>
                                        {post.type}
                                    </span>
                                </td>
                                <td>
                                    <span className="badge" style={{ background: 'var(--bg-card-alt)', color: 'var(--text-body)' }}>{post.status}</span>
                                </td>
                                <td style={{ fontWeight: 600 }}>User #{post.user_id}</td>
                                <td>{new Date(post.created_at).toLocaleDateString()}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {post.status !== 'hidden' && (
                                            <button onClick={() => handleAction(post.id, 'hide')} className="btn-action" style={{ background: '#fef3c7', color: '#92400e' }}>Hide</button>
                                        )}
                                        {post.status === 'hidden' && (
                                            <button onClick={() => handleAction(post.id, 'restore')} className="btn-action" style={{ background: '#dcfce7', color: '#15803d' }}>Restore</button>
                                        )}
                                        <button onClick={() => handleAction(post.id, 'delete')} className="btn-action btn-ban">Delete</button>
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

export default AdminPosts
