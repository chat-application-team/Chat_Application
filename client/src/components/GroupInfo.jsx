import { useState } from 'react';
/*import axiosClient from '../api/axiosClient';*/
import ChatAvatar from './ChatAvatar';
import { chatService } from "../api/chatService";
import { userService } from "../api/userService";

function GroupInfo({ chat, onClose, onLeave }) {
    const [newMember, setNewMember] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleSearch = async (e) => {
      const query = e.target.value;
      setNewMember(query);
      setSelectedUser(null);

      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      const results = await userService.searchUsers(query);
      setSearchResults(results);
    };

    const handleSelectUser = (user) => {
      setSelectedUser(user);
      setNewMember(user.username);
      setSearchResults([]);
    };

    const handleAddMember = async (e) => {
      e.preventDefault();

      if (!selectedUser) {
        alert("Nejdřív vyber uživatele ze seznamu.");
        return;
      }
      const result = await chatService.addMemberToGroup(chat.id, selectedUser.id);

      if (result.success) {
        alert(`Uživatel ${selectedUser.username} byl přidán.`);
        setNewMember('');
        setSelectedUser(null);
        setSearchResults([]);
      } else {
        alert('Chyba při přidávání člena.');
      }
    };

    const handleLeaveGroup = async () => {
      if(window.confirm("Opravdu chcete opustit tuto skupinu?")) {
        const result = await chatService.leaveGroup(chat.id);

        if (result.success) {
          onLeave(chat.id);
        } else {
          alert("Chyba při opouštění skupiny.");
        }
      }
    };

    return (
    <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-3xl border border-violet-100 shadow-2xl w-full max-w-md relative overflow-hidden">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-violet-300 hover:text-violet-700 text-xl font-bold transition"
        >
          &times;
        </button>

        <div className="p-6 border-b border-violet-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
            Správa skupiny
          </p>

          <h2 className="text-2xl font-bold text-violet-900 mt-1">
            {chat.name}
          </h2>
        </div>

        <div className="px-6 py-5 border-b border-violet-100">
          <div className="flex items-center gap-4 rounded-3xl bg-violet-50 p-4">
            <ChatAvatar username={chat.name} size="lg" />

            <div>
              <p className="font-semibold text-violet-900">
                {chat.name}
              </p>

              <p className="text-xs text-violet-400">
                Skupinová konverzace
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAddMember} className="p-6">
          <label className="block text-sm font-semibold text-violet-900 mb-2">
            Přidat uživatele
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMember}
              onChange={handleSearch}
              placeholder="Zadejte jméno..."
              className="flex-1 rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
            />

            <button
              type="submit"
              className="h-12 w-12 rounded-2xl bg-violet-500 text-white font-bold hover:bg-violet-600 transition"
            >
              +
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 max-h-36 overflow-y-auto rounded-3xl border border-violet-100 bg-white p-2 shadow-lg">
              {searchResults.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-violet-50">
                  
                  <ChatAvatar username={user.username} size="sm" />
                  <span className="truncate text-sm font-semibold text-violet-900"> {user.username}</span>
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-violet-100 mt-6 pt-6">
            <button
              onClick={handleLeaveGroup}
              type="button"
              className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-500 hover:text-white transition"
            >
              Opustit skupinu
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default GroupInfo;