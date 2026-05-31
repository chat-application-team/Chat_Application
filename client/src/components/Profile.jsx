import { useState } from "react";
import { useAuth } from "../store/AuthContext";
import axiosClient from "../api/axiosClient";
//import axiosClient from "../api/axiosClient";

function Profile({ onClose }) {
    const { user, setUser } = useAuth();

    //Predvyplneni formular aktualnim jmenem atd.
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState('uzivatel@skolni-projekt.cz');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');

        //temp bez backendu
        console.log('Simuluji uložení profilu na server:', { username, email, password });
        setUser(prev => ({ ...prev, username: username })); // Přepíše jméno rovnou v rohu obrazovky
        onClose();
        /*
        try {
            const upadateData = { username, email };
            if (password) {
                upadateData.password = password;
            }

            const response = await axiosClient.patch('/profile/', upadateData);

            setUser(response.data);
            onClose();

        } catch (error) {
            console.error('Chyba při ukládání profilu: ', error);
            setError(error.response?.data?.detail || 'Nepodařilo se uložit změny.');
        };*/
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl relative">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Nastavení profilu</h2>

        {error && <div className="mb-4 p-2 bg-red-100 text-red-600 rounded text-sm font-semibold">{error}</div>}

        <form onSubmit={handleSave} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uživatelské jméno</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nové heslo (nepovinné)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Zadejte pro změnu hesla"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition"
            >
              Zrušit
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition"
            >
              Uložit změny
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Profile;