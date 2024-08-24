'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import https from 'https';
import { useRouter, useSearchParams } from 'next/navigation';
import './Questionnaire.css';

export default function Questionnaire({ params }) {
  const router = useRouter();
  const { id } = params;
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const createQueryString = (name, value) => {
    const params = new URLSearchParams();
    params.set(name, value);
    return params.toString();
  };

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await axios.get(`https://ec2-52-14-10-131.us-east-2.compute.amazonaws.com:5000/questionnaire/${id}/questions`,
          { httpsAgent: agent }
        );
        setQuestions(response.data);
        // console.log("Questions", response.data);
        const res_questions = response.data;

        const questionTypeMap = res_questions.reduce((acc, question) => {
          acc[question.id] = question.question.type;
          return acc;
        }, {});

        // console.log("Reshsdfds", res_questions);

        const user_answer = await axios.get(`https://ec2-52-14-10-131.us-east-2.compute.amazonaws.com:5000/user_answers/${userId}/${id}`,
          { httpsAgent: agent }
        );
        user_answer.data.map((answer) => {
          const type = questionTypeMap[answer.question_id];
          setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [answer.question_id]: type === 'mcq'
              ? answer.answer.split(', ')
              : answer.answer,
          }));
        });
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      }
    }

    if (id) {
      fetchQuestions();
    }
  }, [id]);

  const validateAnswers = () => {
    let isValid = true;
    let errorMsg = '';

    questions.forEach((question) => {
      if (question.question.type === 'input') {
        if (!answers[question.id] || answers[question.id].trim() === '') {
          isValid = false;
          errorMsg = 'Please fill out all text fields.';
        }
      }
    });

    setError(errorMsg);
    return isValid;
  };

  const handleChange = (questionId, value, type) => {
    setAnswers((prevAnswers) => {
      const currentAnswers = prevAnswers[questionId] || (type === 'mcq' ? [] : '');

      if (type === 'mcq') {
        if (currentAnswers.includes(value)) {
          return {
            ...prevAnswers,
            [questionId]: currentAnswers.filter((answer) => answer !== value),
          };
        } else {
          return {
            ...prevAnswers,
            [questionId]: [...currentAnswers, value],
          };
        }
      } else {
        return {
          ...prevAnswers,
          [questionId]: value,
        };
      }
    });
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      return;
    }

    try {
      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        question_id: questionId,
        questionnaire_id: id,
        answer: Array.isArray(answers[questionId]) ? answers[questionId].join(', ') : answers[questionId],
      }));

      await axios.post('https://ec2-52-14-10-131.us-east-2.compute.amazonaws.com:5000/submit_answers', {
        user_id: userId,
        answers: formattedAnswers,
      }, { httpsAgent: agent }
      );

      router.push('/questionnaires' + "?" + createQueryString("userId", userId));
    } catch (error) {
      console.error('Failed to submit answers:', error);
    }
  };

  return (
    <div className="questionnaire-container">
      <h1 className="questionnaire-header">Questionnaire</h1>
      <form className="questionnaire-form">
        {questions.map((question, index) => (
          <div className="question-item" key={index}>
            <label className="question-label">{question.question.question}</label>
            {question.question.type === 'input' && (
              <input
                type="text"
                className="question-input"
                value={answers[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value, 'input')}
              />
            )}
            {question.question.type === 'mcq' && (
              question.question.options.map((option, i) => (
                <div className="option-item" key={i}>
                  <input
                    type="checkbox"
                    className="question-checkbox"
                    value={option}
                    checked={answers[question.id]?.includes(option) || false}
                    onChange={(e) => handleChange(question.id, e.target.value, 'mcq')}
                  />
                  <label className="option-label">{option}</label>
                </div>
              ))
            )}
          </div>
        ))}
        {error && <p className="error-message">{error}</p>}
        <button type="button" className="submit-button" onClick={handleSubmit}>Submit</button>
      </form>
    </div>
  );
}