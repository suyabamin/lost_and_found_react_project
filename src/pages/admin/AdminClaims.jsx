import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import adminService from '../../services/adminService'
import Swal from 'sweetalert2'
import { FaCheck, FaTimes, FaEye, FaSpinner, FaHistory } from 'react-icons/fa'

const AdminClaims = () => {
    const [claims, setClaims] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchClaims()
    }, [])

    const fetchClaims = async () => {
        setLoading(true)
        try {
            const res = await adminService.getClaims()
            setClaims(res.data.claims || [])
        } catch (err) {
            console.error(err)
            Swal.fire('Error', 'Failed to fetch claims', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (id, status) => {
        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `Do you want to ${status} this claim?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Yes, ${status}`,
            background: 'var(--card-bg, #fff)',
            color: 'var(--text-main, #000)'
        })

        if (result.isConfirmed) {
            try {
                await adminService.resolveClaim(id, { status })
                Swal.fire('Success', `Claim ${status} successfully`, 'success')
                fetchClaims()
            } catch (err) {
                console.error(err)
                Swal.fire('Error', 'Failed to update status', 'error')
            }
        }
    }

    const showDetails = (claim) => {
        Swal.fire({
            title: `Claim for: ${claim.item_title}`,
            html: `
                <div style="text-align: left;">
                    <p><strong>Claimant:</strong> ${claim.claimant_name}</p>
                    <p><strong>Reason:</strong> ${claim.reason}</p>
                    <p><strong>Proof Description:</strong> ${claim.proof_description}</p>
                    <p><strong>Contact:</strong> ${claim.contact_info}</p>
                    ${claim.proof_image ? `<img src="${claim.proof_image}" style="width:100%; border-radius:10px; margin-top:10px;" />` : '<p>No proof image</p>'}
                </div>
            `,
            width: '600px'
        })
    }

    return (
        <AdminLayout title="Manage Claims">
            <div className="admin-card">
                {loading ? (
                    <div className="text-center p-5"><FaSpinner className="spin" /> Loading claims...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Claimant</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claims.map(claim => (
                                <tr key={claim.id}>
                                    <td>{claim.item_title}</td>
                                    <td>{claim.claimant_name}</td>
                                    <td>
                                        <span className={`badge badge-${claim.status}`}>
                                            {claim.status}
                                        </span>
                                    </td>
                                    <td>{new Date(claim.created_at).toLocaleDateString()}</td>
                                    <td className="actions">
                                        <button className="btn-icon" onClick={() => showDetails(claim)} title="View Proof">
                                            <FaEye />
                                        </button>
                                        {claim.status === 'pending' && (
                                            <>
                                                <button className="btn-icon success" onClick={() => handleUpdateStatus(claim.id, 'approved')} title="Approve">
                                                    <FaCheck />
                                                </button>
                                                <button className="btn-icon danger" onClick={() => handleUpdateStatus(claim.id, 'rejected')} title="Reject">
                                                    <FaTimes />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {claims.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center">No claims found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminClaims;
