import { useState } from "react";
import { chatService } from "../api/chatService";
import { userService } from "../api/userService";

function CreateGroup({ onClose, onCreate }) {
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const handleSearch = async (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      const results = await userService.searchUsers(query);
      // Vyfiltrujeme lidi, co už jsou vybraní
      setSearchResults(results.filter(u => !selectedUsers.find(su => su.id === u.id)));
    };

    const handleAddUser = (user) => {
      setSelectedUsers([...selectedUsers, user]);
      setSearchQuery('');
      setSearchResults([]);
    };

    const handleRemoveUser = (id) => {
      setSelectedUsers(selectedUsers.filter(u => u.id !== id));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!groupName.trim() || selectedUsers.length === 0) return;

      // Získáme jen ID vybraných uživatelů
      const memberIds = selectedUsers.map(u => u.id);
      
      // Volání backendu
      const newGroup = await chatService.createGroup(groupName, memberIds);
      
      if (newGroup) {
        onCreate(newGroup);
        onClose();
      } else {
        alert('Vytvoření skupiny se nezdařilo.');
      }
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold">&times;</button>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Vytvořit novou skupinu</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Název skupiny" value={groupName} onChange={(e) => setGroupName(e.target.value)} required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
          />
          
          <div className="border-t pt-3 border-gray-200">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Přidat členy</label>
            <input 
              type="text" placeholder="Hledat uživatele..." value={searchQuery} onChange={handleSearch}
              className="w-full p-2 border rounded bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
            />
            {searchResults.length > 0 && (
              <div className="mt-1 max-h-32 overflow-y-auto border border-gray-200 rounded shadow-sm bg-white">
                {searchResults.map(user => (
                  <div key={user.id} onClick={() => handleAddUser(user)} className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-b-0">
                    {user.username}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto">
            {selectedUsers.map(user => (
              <span key={user.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center font-semibold">
                {user.username}
                <button type="button" onClick={() => handleRemoveUser(user.id)} className="ml-1 text-blue-500 hover:text-red-500 font-bold">&times;</button>
              </span>
            ))}
          </div>

          <button type="submit" disabled={!groupName.trim() || selectedUsers.length === 0} className="w-full mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 font-bold disabled:bg-gray-300 disabled:cursor-not-allowed transition">
            Vytvořit skupinu
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateGroup;