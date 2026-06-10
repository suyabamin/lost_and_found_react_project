import React from 'react';
import { FaQuestionCircle, FaEdit } from 'react-icons/fa';
import styles from '../styles/components/ClaimQuestions.module.css';

const ClaimQuestionsForm = ({ questions, answers, setAnswers }) => {
  if (!questions || questions.length === 0) return null;

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  return (
    <div className={styles.questionsContainer}>
      <h3 className={styles.title}>
        <FaQuestionCircle /> Verification Questions
      </h3>
      <p className={styles.subtitle}>The owner requires you to answer these questions to verify ownership.</p>
      
      <div className={styles.questionsList}>
        {questions.map((q) => (
          <div key={q.id} className={styles.questionCard}>
            <label className={styles.label}>
              <span className={styles.qText}>{q.question_text}</span>
            </label>
            <div className={styles.inputWrapper}>
              <FaEdit className={styles.inputIcon} />
              <textarea
                className={styles.answerInput}
                placeholder="Type your answer here..."
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                required
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClaimQuestionsForm;
