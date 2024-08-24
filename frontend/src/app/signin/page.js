'use client';
import { useState } from 'react';
import axios from 'axios';
import https from 'https';
import { useRouter } from 'next/navigation';
import './Signin.css';

export default function Signin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const createQueryString = (name, value) => {
    const params = new URLSearchParams();
    params.set(name, value);

    return params.toString();
  };

  const handleSignin = async () => {
    try {
      if (username === '' || password === '') {
        alert('Please enter a username and password');
        return;
      }
      const response = await axios.post('https://ec2-52-14-10-131.us-east-2.compute.amazonaws.com:5000/signin', {
        username,
        password,
      }, { httpsAgent: agent });
      // console.log(response.data.user_id);
      router.push('/questionnaires/' + "?" + createQueryString("userId", response.data.user_id));
    } catch (error) {
      alert('Choose a different Username');
    }
  };

  return (
    <div className="login-container">
      <h1 className="page-header">Bioverse - Meet Nirav Diwan</h1>
      <div className="login-box">
        <h1 className="login-header">Sign in</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button onClick={handleSignin} className="login-button">Sign in</button>
      </div>
    </div>
  );
}