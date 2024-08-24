'use client';
import { useState } from 'react';
import https from 'https';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const agent = new https.Agent({
    rejectUnauthorized: false, // Bypass SSL certificate validation
  });

  const createQueryString = (name, value) => {
    const params = new URLSearchParams();
    params.set(name, value);

    return params.toString();
  };

  const handleLogin = async () => {
    try {
      if (username.trim() === '' || password.trim() === '') {
        alert('Please enter a username and password');
        return;
      }
      const response = await axios.post('https://ec2-52-14-10-131.us-east-2.compute.amazonaws.com:5000/login', {
        username,
        password,
      },{ httpsAgent: agent });

      if (response.data.role === 'admin') {
        router.push('/admin');
      } else if (response.data.role === 'user') {
        // console.log(response.data.user_id);
        router.push('/questionnaires/' + "?" + createQueryString("userId", response.data.user_id));
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Enter correct username and password');
    }
  };

  const handleSignin = () => {
    router.push('/signin');
  }

  return (
    <div className="login-container">
      <h1 className="page-header">BIOVERSE - Meet Nirav Diwan</h1>
      <div className="login-box">
        <h1 className="login-header">Log in</h1>
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
        <button onClick={handleLogin} className="login-button">Log in</button>
        <button onClick={handleSignin} className="login-button">Go to Sign up</button>
      </div>
    </div>
  );
}