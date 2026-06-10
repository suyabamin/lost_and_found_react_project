import React, { useState } from 'react';
import { FaPlus, FaTrash, FaQuestionCircle } from 'react-icons/fa';
import styles from '../styles/components/VerificationQuestions.module.css';

const VerificationQuestionsSection = ({ questions, setQuestions }) => {
  const [newQuestion, setNewQuestion] = useState('');

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addQuestion();
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        <FaQuestionCircle /> Verification Questions
      </h3>
      <p className={styles.sectionDesc}>
        Add custom questions to verify ownership during the claim process. (Optional)
      </p>

      <div className={styles.inputGroup}>
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., What color is the item?"
          className={styles.questionInput}
        />
        <button 
          type="button" 
          onClick={addQuestion} 
          className={styles.addBtn}
          disabled={!newQuestion.trim()}
        >
          <FaPlus /> Add Question
        </button>
      </div>

      <div className={styles.questionsList}>
        {questions.map((q, index) => (
          <div key={index} className={styles.questionItem}>
            <span className={styles.questionText}>{q}</span>
            <button 
              type="button" 
              onClick={() => removeQuestion(index)} 
              className={styles.removeBtn}
              title="Remove question"
            >
              <FaTrash />
            </button>
          </div>
        ))}
        {questions.length === 0 && (
          <p className={styles.emptyText}>No verification questions added yet.</p>
        )}
      </div>

      <div className={styles.placeholders}>
        <span className={styles.placeholderLabel}>Example questions:</span>
        <div className={styles.placeholderChips}>
          {['What brand is it?', 'Any unique mark?', 'How many keys?'].map((p, i) => (
            <span key={i} className={styles.chip} onClick={() => setNewQuestion(p)}>{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerificationQuestionsSection;
