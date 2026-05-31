import { useState } from 'react';
//import axiosClient from '../api/axiosClient';

function GroupInfo({ chat, onClose, onLeave }) {

    const [members, setMembers] = useState([
        { id: 101, username: 'Petr Novotný', role: 'Admin' },
        { id: 102, username: 'Pavel (Frontend)', role: 'Člen' }
    ]);
    const [error, setError] = useState('');

    const [availableUsers, setAvailableUsers] = useState([
        { id: 103, username: 'Školní Admin', role: 'Člen' },
        { id: 104, username: 'Jana Dvořáková', role: 'Člen' }
    ]);

    const [showAddMenu, setShowAddMenu] = useState(false);

    const handleAddMember = (newUser) => {
        setMembers(prev => [...prev, newUser]);
        setAvailableUsers(prev => prev.filter(u => u.id !== newUser.id));
    
        //temp
        console.log(`Přidávám uživatele ${newUser.username} do skupiny ${chat.name}`);
    
        /*
        try {
            await axiosClient.post(`/chats/groups/${chat.id}/members/`, { userId: newUser.id });
        } catch (err) {
            console.error('Chyba při přidávání člena:', err);
        }*/
    };

    const handleLeaveGroup = async () => {
        setError('');
        console.log('Opouštím skupinu:', chat.name);
        onLeave(chat.id);
        onClose();

        /*
        try {
        await axiosClient.post(`/chats/groups/${chat.id}/leave/`);
        onLeave(chat.id);
        onClose();
        } catch (err) {
        console.error('Chyba při opouštění skupiny:', err);
        setError(err.response?.data?.detail || 'Nepodařilo se opustit skupinu.');
        }*/

    /* Pak s backendem
    useEffect(() => {
    const fetchMembers = async () => {
        try {
            const response = await axiosClient.get(`/chats/groups/${chat.id}/members/`);
            setMembers(response.data);
        } catch (err) {
            console.error('Nelze načíst členy skupiny:', err);
            setError('Nepodařilo se načíst seznam členů.');
        }
    };
    fetchMembers();
    }, [chat.id]);*/
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold">
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-800">{chat.name}</h2>
        
        {error && <div className="mb-4 p-2 bg-red-100 text-red-600 rounded text-sm font-semibold">{error}</div>}

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2 border-b pb-1">Členové skupiny</h3>
          <ul className="space-y-2 max-h-40 overflow-y-auto">
            {members.map(member => (
              <li key={member.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded border border-gray-100">
                <span className="font-medium text-gray-800">{member.username}</span>
                <span className="text-xs text-gray-500">{member.role}</span>
              </li>
            ))}
          </ul>
          
          {/* Vylepšené tlačítko, které přepíná zobrazení nabídky */}
          <button 
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="mt-3 w-full py-1 text-sm text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded transition font-medium"
          >
            {showAddMenu ? 'Skrýt nabídku' : '+ Přidat další členy'}
          </button>

          {/* NOVÉ: Skrytá nabídka, která vyjede po kliknutí */}
          {showAddMenu && (
            <div className="mt-2 border border-gray-200 rounded bg-white shadow-sm p-2 transition-all">
              <p className="text-xs text-gray-500 mb-1">Dostupní uživatelé:</p>
              {availableUsers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-2">Všichni už jsou ve skupině.</p>
              ) : (
                <ul className="space-y-1">
                  {availableUsers.map(u => (
                    <li 
                      key={`add-${u.id}`} 
                      onClick={() => handleAddMember(u)}
                      className="flex justify-between items-center text-sm p-2 hover:bg-green-50 hover:text-green-700 rounded cursor-pointer transition border border-transparent hover:border-green-200"
                    >
                      <span>{u.username}</span>
                      <span className="font-bold text-lg leading-none">+</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button 
            onClick={handleLeaveGroup}
            className="w-full px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 transition"
          >
            Opustit skupinu
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroupInfo;