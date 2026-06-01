import { useState } from "react";
import axiosClient from "../api/axiosClient";

function CreateGroup({ onClose, onCreate }) {
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);

    const mockFriends = [
        { id: 101, username: 'Petr Novotný' },
        { id: 102, username: 'Pavel (Frontend)' },
        { id: 103, username: 'Školní Admin' },
        { id: 104, username: 'Jana Dvořáková' }
    ];

    const handleToggleUser = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName.trim() || selectedUsers.length === 0) return;

        //temp
        console.log('Vytvářím skupinu:', groupName, 's uživateli:', selectedUsers);

        const newGroup = {
            id: Date.now(),
            name: `Group --> ${groupName}`,
            is_group: true,
            unread_count: 0
        };

        onCreate(newGroup);
        onClose();
        /*
        try {
            const  response = await axiosClient.post('/chats/groups/', {
                name: groupName,
                members: selectedUsers
            });
            onCreate(response.data);
            onClose();
        } catch (error) {
            console.error('Nelze vytvořit skupinu:', error);
        }*/
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold">
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Nová skupina</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Název skupiny</label>
            <input 
              type="text" 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Např. Školní projekt..."
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vyberte členy</label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2 space-y-2 bg-gray-50">
              {mockFriends.map(friend => (
                <label key={friend.id} className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-gray-100 rounded">
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.includes(friend.id)}
                    onChange={() => handleToggleUser(friend.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-800">{friend.username}</span>
                </label>
              ))}
            </div>
            {selectedUsers.length === 0 && <p className="text-xs text-red-500 mt-1">Vyberte alespoň jednoho člena.</p>}
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition">Zrušit</button>
            <button 
              type="submit" 
              disabled={!groupName.trim() || selectedUsers.length === 0}
              className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Vytvořit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGroup;