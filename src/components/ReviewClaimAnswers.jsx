import React from 'react';
import ClaimAnswerCard from './ClaimAnswerCard';
import { FaCheckCircle, FaClipboardCheck } from 'react-icons/fa';
import styles from '../styles/components/ReviewClaim.module.css';

const ReviewClaimAnswers = ({ answers }) => {
  if (!answers || answers.length === 0) return null;

  return (
    <div className={styles.reviewSection}>
      <h4 className={styles.sectionTitle}>
        <FaClipboardCheck /> Verification Answers
      </h4>
      <div className={styles.answersGrid}>
        {answers.map((qa, index) => (
          <ClaimAnswerCard 
            key={index} 
            question={qa.question_text} 
            answer={qa.answer_text} 
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewClaimAnswers;
