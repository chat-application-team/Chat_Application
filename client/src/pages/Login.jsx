import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

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
    <div className="flex h-screen items-center justify-center bg-violet-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-8 shadow-2xl">

        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
            Vítej zpět
          </p>

          <h2 className="mt-1 text-3xl font-bold text-violet-900">
            Přihlášení
          </h2>

          <p className="mt-2 text-sm text-violet-400">
            Přihlas se do svého účtu.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Uživatelské jméno"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3 text-sm text-violet-900 outline-none transition placeholder:text-violet-300 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
          />

          <input
            type="password"
            placeholder="Heslo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3 text-sm text-violet-900 outline-none transition placeholder:text-violet-300 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-violet-600 hover:shadow-lg"
        >
          Přihlásit se
        </button>

        <p className="mt-5 text-center text-sm text-violet-400">
          Nemáte účet?{" "}
          <span
            onClick={() => navigate("/auth/register")}
            className="cursor-pointer font-semibold text-violet-600 hover:underline"
          >
            Zaregistrujte se
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;