'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import https from 'https';
import { useRouter } from 'next/navigation';
import './Admin.css';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const agent = new https.Agent({
    rejectUnauthorized: false, // Bypass SSL certificate validation
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await axios.get('https://ec2-52-14-10-131.us-east-2.compute.amazonaws.com:5000/admin/users',
          { httpsAgent: agent }
        );
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError('Failed to load users.');
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleSelectUser = async (userId) => {
    setSelectedUser(userId);
    try {
      setLoading(true);
      const response = await axios.get(`https://ec2-52-14-10-131.us-east-2.compute.amazonaws.com:5000/admin/user_answers/${userId}`,
        { httpsAgent: agent }
      );
      setUserAnswers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user answers:', error);
      setError('Failed to load user answers.');
      setLoading(false);
    }
  };

  const groupedAnswers = userAnswers.reduce((groups, answer) => {
    if (!groups[answer.questionnaire]) {
      groups[answer.questionnaire] = [];
    }
    groups[answer.questionnaire].push(answer);
    return groups;
  }, {});

  return (
    <div className="container">
      <h1 className="header">Admin Panel</h1>
      {error && <p className="message message-error">{error}</p>}
      {loading ? (
        <p className="message message-loading">Loading...</p>
      ) : (
        <ul className="user-list">
          {users.map((user, index) => (
            <li className="user-list-item" key={index} onClick={() => handleSelectUser(user.user_id)}>
              User - {user.username} - {user.count} questionnaires completed
            </li>
          ))}
        </ul>
      )}
      {selectedUser && !loading && (
        <div>
          <h2 className="answers-header">User {selectedUser} Answers</h2>
          {Object.keys(groupedAnswers).map((questionnaire, index) => (
            <div className="answer-item" key={index}>
              <strong className="answer-title">{questionnaire}</strong>
              {groupedAnswers[questionnaire].map((answer, idx) => (
                <div key={idx} className="answer-content">
                  <p><strong>Q:</strong> {answer.question}</p>
                  <p><strong>A:</strong> {answer.answer}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <button onClick={() => router.push('/')} className="admin-logout-button">Log Out</button>
    </div>
  );
}