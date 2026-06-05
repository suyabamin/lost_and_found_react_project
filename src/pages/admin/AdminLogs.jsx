import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import axios from 'axios'

const AdminLogs = () => {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/admin/logs', { withCredentials: true })
                setLogs(response.data.logs)
            } catch (err) {
                console.error('Failed to fetch logs:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchLogs()
    }, [])

    if (loading) return <AdminLayout title="System Logs"><div>Loading...</div></AdminLayout>

    return (
        <AdminLayout title="System Activity Logs">
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Log ID</th>
                            <th>Action</th>
                            <th>User</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td style={{ color: '#64748b' }}>#{log.id}</td>
                                <td style={{ fontWeight: 600 }}>{log.action}</td>
                                <td>{log.user}</td>
                                <td>{log.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    )
}

export default AdminLogs
