import { useState } from 'react';
import axiosClient from '../api/axiosClient';

function GroupInfo({ chat, onClose, onLeave }) {
    const [newMember, setNewMember] = useState('');

    const handleAddMember = async (e) => {
      e.preventDefault();
      if (!newMember.trim()) return;

      try {
        await axiosClient.post(`/api/chat/chats/${chat.id}/add-member/`, { username: newMember });
        alert(`Uživatel ${newMember} byl přidán.`);
        setNewMember('');
      } catch (error) {
        console.error('Nelze přidat člena:', error);
        alert('Chyba při přidávání člena.');
      }
    };

    const handleLeaveGroup = async () => {
      if(window.confirm("Opravdu chcete opustit tuto skupinu?")) {
        try {
          await axiosClient.delete(`/api/chat/chats/${chat.id}/add-member/`);
          onLeave(chat.id);
        } catch (error) {
          console.error('Chyba při opouštění skupiny:', error);
        }
      }
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold">&times;</button>
        <h2 className="text-xl font-bold mb-4 text-gray-800">{chat.name}</h2>
        
        <form onSubmit={handleAddMember} className="mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Přidat uživatele (jméno)</label>
          <div className="flex space-x-2">
            <input 
              type="text" value={newMember} onChange={(e) => setNewMember(e.target.value)} placeholder="Zadejte jméno..." 
              className="flex-1 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" 
            />
            <button type="submit" className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm font-bold">+</button>
          </div>
        </form>

        <div className="border-t pt-4">
          <button onClick={handleLeaveGroup} className="w-full bg-red-50 text-red-600 border border-red-200 p-2 rounded hover:bg-red-500 hover:text-white transition font-semibold">
            Opustit skupinu
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroupInfo;