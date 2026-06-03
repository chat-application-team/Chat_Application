import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

function Login({ onSwitchToRegister }) {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(username, password);
        
        if (result.success) {
            navigate('/chat');
        } else {
            setError(result.message);
        }
    };

    return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Přihlášení</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm text-center">{error}</div>}
        <input 
          type="text" placeholder="Uživatelské jméno" value={username} onChange={(e) => setUsername(e.target.value)} required
          className="w-full p-2 mb-4 border rounded"
        />
        <input 
          type="password" placeholder="Heslo" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="w-full p-2 mb-6 border rounded"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition font-bold">Přihlásit se</button>
        <p className="mt-4 text-center text-sm">
          Nemáte účet? <span onClick={() => navigate('/auth/register')} className="text-blue-500 cursor-pointer hover:underline">Zaregistrujte se</span>
        </p>
      </form>
    </div>
  );
}

export default Login;