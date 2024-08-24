'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import https from 'https';
import { useRouter, useSearchParams } from 'next/navigation';
import './Questionnaires.css';

export default function Questionnaires() {
  const [questionnaires, setQuestionnaires] = useState([]);
  const router = useRouter();
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
    async function fetchQuestionnaires() {
      try {
        const response = await axios.get('https://ec2-52-14-10-131.us-east-2.compute.amazonaws.com:5000/questionnaires',
          { httpsAgent: agent }
        );
        setQuestionnaires(response.data);
        // console.log("Console log response.data", response.data);
        // console.log("router", searchParams.get("userId"));
      } catch (error) {
        console.error('Failed to fetch questionnaires:', error);
      }
    }

    fetchQuestionnaires();
  }, [searchParams]);

  const handleSelect = (id) => {
    // console.log('Selected questionnaire:', id);
    router.push(`/questionnaire/${id}?${createQueryString("userId", userId)}`);
  };

  return (
    <div className="questionnaire-container">
      <h1 className="questionnaire-header">Select a Questionnaire</h1>
      <ul className="questionnaire-list">
        {questionnaires.map((q, index) => (
          <li
            key={index}
            onClick={() => handleSelect(q.id)}
            className="questionnaire-item"
          >
            {q.name}
          </li>
        ))}
      </ul>
      <button onClick={() => router.push('/')} className="questionnaire-logout-button">Log Out</button>
    </div>
  );
}