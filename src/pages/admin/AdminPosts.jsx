import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import axios from 'axios'
import Swal from 'sweetalert2'

const AdminPosts = () => {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/posts', { withCredentials: true })
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
            await axios.post(`http://127.0.0.1:8000/api/admin/posts/${postId}/action`, { action }, { withCredentials: true })
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
                                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#eee', overflow: 'hidden' }}>
                                        <img src={post.image_url || 'https://via.placeholder.com/48'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </td>
                                <td style={{ fontWeight: 600 }}>{post.title}</td>
                                <td>
                                    <span className={`badge`} style={{ background: post.type === 'lost' ? '#fee2e2' : '#dcfce7', color: post.type === 'lost' ? '#991b1b' : '#166534' }}>
                                        {post.type}
                                    </span>
                                </td>
                                <td>
                                    <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{post.status}</span>
                                </td>
                                <td>User #{post.user_id}</td>
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
