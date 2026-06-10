import React from 'react';
import styles from '../styles/components/ReviewClaim.module.css';

const ClaimAnswerCard = ({ question, answer }) => {
  return (
    <div className={styles.answerCard}>
      <div className={styles.questionSection}>
        <span className={styles.qLabel}>Question:</span>
        <p className={styles.questionText}>{question}</p>
      </div>
      <div className={styles.answerSection}>
        <span className={styles.aLabel}>Answer:</span>
        <p className={styles.answerText}>{answer}</p>
      </div>
    </div>
  );
};

export default ClaimAnswerCard;
