import React, { useState } from 'react';
import {
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import api from '@/components/api/api';

export function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(''); // Reset error message

    try {
      const response = await api.post('/users/login', { username, password });
      console.log(response.data); // For debugging response
      if (response.data && response.data.token) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        alert('Login successful!');
        navigate('/dashboard/customer');
      } else {
        setMsg('Token not found in the response.');
      }
    } catch (error) {
      console.error(error);
      setMsg('An error occurred while logging in.');
    }
  };

  return (
    <section className="flex items-center justify-between w-full h-screen">
      {/* Left Side - Image */}
      <div className="w-full lg:w-1/2 h-full flex justify-center items-center">
        <img
          src="/img/Pharmacist-cuate.png"
          className="object-cover w-full h-full"
          alt="Sign In Illustration"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center bg-white">
        <div className="text-center mb-6">
          <Typography variant="h3" className="font-semibold mb-4 text-black">Sign In</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-medium">
            Please enter your username and password to log in.
          </Typography>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-8">
          {msg && (
            <Typography variant="small" color="red" className="mb-4 text-center">
              {msg}
            </Typography>
          )}
          <div className="flex flex-col gap-6">
            {/* Username */}
            <Input
              size="lg"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="rounded-lg"
            />
            
            {/* Password */}
            <Input
              type="password"
              size="lg"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg"
            />
          </div>

          <Button
            type="submit"
            fullWidth
            className="mt-6 bg-black hover:bg-black text-white rounded-lg"
            disabled={loading}
          >
            {loading ? <span className="loader"></span> : 'Sign In'}
          </Button>

          <div className="mt-4 text-center">
            <Typography variant="small" color="blue-gray" className="text-sm">
              Not registered? <Link to="/auth/sign-up" className="text-blue-600">Create an account</Link>
            </Typography>
          </div>
        </form>
      </div>
    </section>
  );
}

export default SignIn;
