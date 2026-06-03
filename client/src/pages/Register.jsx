import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate(); // PŘIDÁNO
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await register(username, email, password);
        
        if (result.success) {
            navigate('/chat'); // Po úspěšné registraci přesměruje do chatu
        } else {
            setError(result.message);
        }
    };

    return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Registrace</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm text-center">{error}</div>}
        <input 
          type="text" placeholder="Uživatelské jméno" value={username} onChange={(e) => setUsername(e.target.value)} required
          className="w-full p-2 mb-4 border rounded"
        />
        <input 
          type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="w-full p-2 mb-4 border rounded"
        />
        <input 
          type="password" placeholder="Heslo" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="w-full p-2 mb-6 border rounded"
        />
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition font-bold">Zaregistrovat</button>
        <p className="mt-4 text-center text-sm">
          Již máte účet? <span onClick={() => navigate('/auth/login')} className="text-blue-500 cursor-pointer hover:underline">Přihlaste se</span>
        </p>
      </form>
    </div>
  );
}

export default Register;