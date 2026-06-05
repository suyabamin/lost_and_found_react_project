import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaStar, FaCheckCircle, FaSpinner, FaArrowLeft, FaMoneyBillWave } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import apiClient from '../services/api'
import Swal from 'sweetalert2'
import Header from '../components/Header'
import Footer from '../components/Footer'
import styles from '../styles/pages/ReturnItem.module.css'

const ReturnItemPage = () => {
  const { trackingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tracking, setTracking] = useState(null)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [review, setReview] = useState('')
  const [rewardAmount, setRewardAmount] = useState(0)
  const [customAmount, setCustomAmount] = useState('')
  const [showReward, setShowReward] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [paymentNumber, setPaymentNumber] = useState('')

  const rewardOptions = [100, 200, 500, 1000]

  useEffect(() => {
    fetchTrackingSession()
  }, [trackingId])

  useEffect(() => {
    if (paymentMethod && tracking) {
      const methodKey = `${paymentMethod.toLowerCase()}_number`
      const isLostPost = tracking.item_type === 'lost'
      // If it was a LOST post, owner pays claimant. If it was a FOUND post, claimant pays owner.
      const details = isLostPost ? tracking.claimant_details : tracking.owner_details
      const number = details?.[methodKey] || 'Not provided'
      setPaymentNumber(number)
    }
  }, [paymentMethod, tracking])

  const fetchTrackingSession = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get(`/tracking/${trackingId}`)
      setTracking(res.data.session)
    } catch (err) {
      console.error(err)
      Swal.fire('Error', 'Could not load tracking session.', 'error')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleAmountSelect = (amount) => {
    setRewardAmount(amount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (e) => {
    const val = e.target.value
    setCustomAmount(val)
    setRewardAmount(val ? Number(val) : 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      return Swal.fire('Rating Required', 'Please select a star rating to continue.', 'warning')
    }

    if (showReward) {
      if (!rewardAmount || rewardAmount < 10) {
        return Swal.fire('Invalid Amount', 'Minimum reward amount is 10 BDT.', 'warning')
      }
      if (rewardAmount > 50000) {
        return Swal.fire('Invalid Amount', 'Maximum reward amount is 50,000 BDT.', 'warning')
      }
      if (!paymentMethod) {
        return Swal.fire('Payment Method Required', 'Please select a payment method.', 'warning')
      }
      if (!transactionId) {
        return Swal.fire('Transaction ID Required', 'Please enter the Transaction ID after sending the payment.', 'warning')
      }
    }

    const result = await Swal.fire({
      title: 'Finalize Return?',
      text: showReward 
        ? `You are sending a reward of ${rewardAmount} BDT. Ensure payment is sent before confirming.`
        : 'This will mark the item as returned and archive the session.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Finalize',
      confirmButtonColor: '#14B8A6'
    })

    if (result.isConfirmed) {
      setSubmitting(true)
      try {
        await apiClient.post(`/return-item/${trackingId}`, {
          rating,
          review,
          reward_amount: showReward ? rewardAmount : 0,
          payment_method: paymentMethod,
          transaction_id: transactionId
        })
        await Swal.fire('Success!', 'The item has been successfully returned and archived.', 'success')
        navigate('/dashboard')
      } catch (err) {
        console.error(err)
        Swal.fire('Error', err.response?.data?.message || 'Failed to complete return.', 'error')
      } finally {
        setSubmitting(false)
      }
    }
  }

  if (loading) return <div className={styles.loading}><FaSpinner className={styles.spin} /> Loading...</div>
  if (!tracking) return <div className={styles.error}>Session not found.</div>

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.card}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back to Tracking
          </button>

          <div className={styles.header}>
            <h1>Finalize Item Return</h1>
            <p>Please complete this form to close the recovery process for <strong>{tracking.item_title}</strong>.</p>
          </div>

          {/* Logic variables */}
          {( () => {
            const isLostPost = tracking.item_type === 'lost';
            const isOwner = Number(user?.id) === Number(tracking.owner_id);
            const isLoster = (isLostPost && isOwner) || (!isLostPost && !isOwner);
            window._isLoster = isLoster; // Temporary hack to use in JSX below if needed, but I'll use inline
            return null;
          })()}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Step 1: Rating */}
            <div className={styles.section}>
              <h3>1. Rate your experience with {Number(user?.id) === Number(tracking.owner_id) ? tracking.claimant_name : tracking.owner_name} *</h3>
              <div className={styles.starRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={styles.starBtn}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <FaStar 
                      className={(hover || rating) >= star ? styles.starFilled : styles.starEmpty} 
                    />
                  </button>
                ))}
                <span className={styles.ratingLabel}>
                  {rating > 0 ? `${rating} Stars` : 'Select stars'}
                </span>
              </div>
            </div>

            {/* Step 2: Review */}
            <div className={styles.section}>
              <h3>2. Add a review (Optional)</h3>
              <textarea
                className={styles.textarea}
                placeholder="Share your experience..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>

            {/* Step 3: Reward (Only for the Loster - person who lost the item) */}
            {((tracking.item_type === 'lost' && Number(user?.id) === Number(tracking.owner_id)) || 
              (tracking.item_type === 'found' && Number(user?.id) === Number(tracking.claimant_id))) && (
              <div className={styles.section}>
                <div className={styles.rewardToggle}>
                  <h3>3. Optional Reward For Finder</h3>
                  <button 
                    type="button" 
                    className={showReward ? styles.toggleOn : styles.toggleOff}
                    onClick={() => {
                      setShowReward(!showReward);
                      if (!showReward) { setRewardAmount(0); setPaymentMethod(''); setTransactionId(''); }
                    }}
                  >
                    {showReward ? 'No reward required' : 'Send a reward to thank the finder'}
                  </button>
                </div>
                
                {showReward && (
                  <div className={styles.rewardDetails}>
                    <p className={styles.hint}>Show your appreciation to the finder of your item.</p>
                    
                    <div className={styles.rewardArea}>
                      <label>Select Amount (BDT)</label>
                      <div className={styles.chipGrid}>
                        {rewardOptions.map(amount => (
                          <button
                            key={amount}
                            type="button"
                            className={rewardAmount === amount && !customAmount ? styles.chipActive : styles.chip}
                            onClick={() => handleAmountSelect(amount)}
                          >
                            {amount} BDT
                          </button>
                        ))}
                        <div className={`${styles.customAmount} ${customAmount ? styles.chipActive : ''}`}>
                          <input 
                            type="number" 
                            placeholder="Custom" 
                            className={styles.customInput}
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                          />
                          <span>BDT</span>
                        </div>
                      </div>

                      <div className={styles.paymentMethods}>
                        <label>Select Payment Method *</label>
                        <div className={styles.methodGrid}>
                          {['bKash', 'Nagad', 'Rocket'].map(method => (
                            <button
                              key={method}
                              type="button"
                              className={paymentMethod === method ? styles.methodBtnActive : styles.methodBtn}
                              onClick={() => setPaymentMethod(method)}
                            >
                              <img 
                                src={
                                  method === 'bKash' ? 'https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg' :
                                  method === 'Nagad' ? 'https://www.vectorlogo.zone/logos/nagad/nagad-ar21.svg' :
                                  'https://www.vectorlogo.zone/logos/dutchbanglabank/dutchbanglabank-ar21.svg' // Rocket is DBBL
                                } 
                                alt={method} 
                                className={styles.methodIcon} 
                              />
                              {method}
                            </button>
                          ))}
                        </div>
                      </div>

                      {paymentMethod && (
                        <div className={styles.paymentInstructions}>
                          <div className={styles.instructionHeader}>
                            <FaMoneyBillWave />
                            <span>Payment Instructions</span>
                          </div>
                          <div className={styles.instructionBody}>
                            <p>Please send <strong>{rewardAmount || '_'} BDT</strong> to the finder's {paymentMethod} number:</p>
                            <div className={styles.numberBox}>
                              <span className={styles.number}>{paymentNumber}</span>
                              <button 
                                type="button" 
                                className={styles.copyBtn}
                                onClick={() => {
                                  navigator.clipboard.writeText(paymentNumber);
                                  Swal.fire({ title: 'Copied!', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, icon: 'success' });
                                }}
                              >
                                Copy Number
                              </button>
                            </div>
                            <p className={styles.warning}>Make the payment manually via your {paymentMethod} app, then enter the Transaction ID below.</p>
                          </div>

                          <div className={styles.transactionInput}>
                            <label>Transaction ID *</label>
                            <input 
                              type="text" 
                              placeholder="e.g. A1B2C3D4E5" 
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                              className={styles.inputField}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className={styles.footer}>
              <button 
                type="submit" 
                className={styles.submitBtn} 
                disabled={submitting || rating === 0}
              >
                {submitting ? <FaSpinner className={styles.spin} /> : <FaCheckCircle />}
                Complete Return Process
              </button>
              <p className={styles.finalHint}>Item status will be set to processing until both parties confirm.</p>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ReturnItemPage
