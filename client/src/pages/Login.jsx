import { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    //Lokalní stavy
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(username, password);

        if (result.success) {
            //Pokud v poho, presměrujeme na chat
            navigate('/');
        } else {
            //Pokud selhalo chyba z backendu
            setError(result.message);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
        <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">Přihlášení do chatu</h2>
            
            {error && <div className="mb-3 text-sm text-red-500 font-semibold">{error}</div>}
            
            <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Uživatelské jméno</label>
            <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded" 
                required
            />
            </div>

            <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Heslo</label>
            <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded" 
                required
            />
            </div>

            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded font-bold">
            Přihlásit se
            </button>

            <div className="mt-4 text-center text-sm">
                Nemáte účet? <Link to="/auth/register" className="text-blue-500 hover:underline">Zaregistrujte se</Link>
            </div>
        </form>
        </div>
  );
}

export default Login;