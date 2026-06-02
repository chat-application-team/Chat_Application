import { useState } from "react";
import { useAuth } from "../store/AuthContext";
import userService from "../api/userService";

function Profile({ onClose }) {
    const { user, setUser } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [bio, setBio] = useState(user?.bio || ''); // PŘIDÁNO
    const [password, setPassword] = useState('');
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });


    const handleSave = async (e) => {
        e.preventDefault();
        setStatusMsg({ text: 'Ukládám...', type: 'info' });

        try {
            const updateRes = await userService.updateProfile({ username, email, bio });
            setUser(updateRes); 

            if (password.trim() !== '') {
                await userService.changePassword({ new_password: password });
                setPassword('');
            }

            setStatusMsg({ text: 'Profil byl úspěšně aktualizován!', type: 'success' });
            setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Chyba aktualizace:', error);
            setStatusMsg({ text: 'Při ukládání došlo k chybě.', type: 'error' });
        }
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-gray-800">Můj Profil</h2>
        
        {statusMsg.text && (
          <div className={`p-2 mb-4 rounded text-sm text-center font-bold ${statusMsg.type === 'error' ? 'bg-red-100 text-red-700' : statusMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Uživatelské jméno</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">O mně (Bio)</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Napište něco o sobě..."
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
            />
          </div>
          <div className="border-t pt-4 mt-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Nové heslo (nepovinné)</label>
            <input type="password" placeholder="Nechte prázdné pro zachování" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-semibold transition">Zrušit</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold transition shadow-sm">Uložit změny</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;