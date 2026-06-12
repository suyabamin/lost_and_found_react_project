import React from 'react';
import ClaimAnswerCard from './ClaimAnswerCard';
import { FaCheckCircle, FaClipboardCheck } from 'react-icons/fa';
import styles from '../styles/components/ReviewClaim.module.css';

const ReviewClaimAnswers = ({ answers }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  
  if (!answers || answers.length === 0) return null;

  return (
    <div className={styles.reviewSection}>
      <div 
        className={styles.sectionHeaderToggle} 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h4 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
          <FaClipboardCheck /> Verification Answers
        </h4>
        <button className={styles.toggleBtn}>
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {isExpanded && (
        <div className={styles.answersGrid} style={{ marginTop: '1.5rem' }}>
          {answers.map((qa, index) => (
            <ClaimAnswerCard 
              key={index} 
              question={qa.question_text} 
              answer={qa.answer_text} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewClaimAnswers;
