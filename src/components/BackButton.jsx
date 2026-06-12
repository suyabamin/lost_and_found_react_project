import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

const BackButton = () => {
  const navigate = useNavigate()

  return (
    <button className="global-back-btn" onClick={() => navigate(-1)}>
      <FaArrowLeft /> Back
    </button>
  )
}

export default BackButton
