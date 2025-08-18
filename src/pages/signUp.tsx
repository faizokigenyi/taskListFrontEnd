import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (response.ok) {
        alert('Sign up successful. Please log in.');
        navigate('/signin');
      } else {
        const error = await response.json();
        alert(error.message || 'Sign up failed');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      alert('Sign up failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSignUp}
        className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl space-y-6"
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center">Create Account</h2>
        <p className="text-sm text-gray-500 text-center">
          Fill in the details below to create your account
        </p>

        <div className="space-y-4">
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="First Name"
            required
            minLength={3}
            maxLength={96}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          />
          <input
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Last Name (optional)"
            minLength={3}
            maxLength={96}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            maxLength={96}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={8}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg"
        >
          Sign Up
        </button>

        <p className="text-sm text-gray-500 text-center">
          Already have an account?{' '}
          <Link to="/signin" className="text-blue-600 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
