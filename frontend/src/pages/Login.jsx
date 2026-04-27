import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      alert('Login failed. Check credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-96">
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">Gym DBMS</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-gray-300 block mb-2 font-medium">Username</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              value={username} onChange={e => setUsername(e.target.value)}
              placeholder="admin" required 
            />
          </div>
          <div>
            <label className="text-gray-300 block mb-2 font-medium">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="********" required 
            />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
