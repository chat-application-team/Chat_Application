import { useState } from "react";
import { chatService } from "../api/chatService";
import { userService } from "../api/userService";
import ChatAvatar from "./ChatAvatar";

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
      const newGroup = await chatService.createGroup(groupName);
      
      if (newGroup) {
        for (const userId of memberIds) {
          await chatService.addMemberToGroup(newGroup.id, userId);
        }

        onCreate(newGroup);
        onClose();
      } else {
        alert('Vytvoření skupiny se nezdařilo.');
      }
    };

      const canCreate = groupName.trim().length > 0 && selectedUsers.length > 0;
      const previewName = groupName.trim() || "Nová skupina";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="relative w-full max-w-md rounded-3xl border border-violet-100 bg-white shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 text-xl font-bold text-violet-300 transition hover:text-violet-700">
          &times;
        </button>

        <div className="border-b border-violet-100 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">Skupinový chat</p>
          <h2 className="mt-1 text-2xl font-bold text-violet-900">Vytvořit skupinu</h2>
        </div>

        <div className="border-b border-violet-100 px-6 py-5">
          <div className="flex items-center gap-4 rounded-3xl bg-violet-50 px-4 py-4">
            <ChatAvatar username={previewName} size="lg" />

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-violet-900">{previewName}</p>
              <p className="text-xs text-violet-400">
                {selectedUsers.length === 0
                  ? "Zatím žádní členové"
                  : `${selectedUsers.length} ${selectedUsers.length === 1 ? "člen" : "členové"}`}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-semibold text-violet-900">Název skupiny</label>
            <input type="text" placeholder="Např. Projektový tým" value={groupName} onChange={(e) => setGroupName(e.target.value)} required className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3 text-sm text-violet-900 outline-none transition placeholder:text-violet-300 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100" />
          </div>

          <div className="border-t border-violet-100 pt-4">
            <label className="mb-1 block text-sm font-semibold text-violet-900">Přidat členy</label>
            <input type="text" placeholder="Hledat uživatele..." value={searchQuery} onChange={handleSearch} className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3 text-sm text-violet-900 outline-none transition placeholder:text-violet-300 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100" />

            {searchResults.length > 0 && (
              <div className="mt-2 max-h-36 overflow-y-auto rounded-3xl border border-violet-100 bg-white p-2 shadow-lg">
                {searchResults.map((user) => (
                  <button type="button" key={user.id} onClick={() => handleAddUser(user)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-violet-50">
                    <ChatAvatar username={user.username} size="sm" />

                    <span className="truncate text-sm font-semibold text-violet-900">
                      {user.username}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedUsers.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-violet-900">Vybraní členové</p>

              <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
                {selectedUsers.map((user) => (
                  <span key={user.id} className="flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700">
                    {user.username}

                    <button type="button" onClick={() => handleRemoveUser(user.id)} className="text-violet-300 transition hover:text-rose-500">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={!canCreate} className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold transition ${
            canCreate
              ? "bg-violet-500 text-white shadow-md hover:bg-violet-600 hover:shadow-lg"
              : "bg-violet-50 text-violet-300 cursor-not-allowed"
          }`}>
            Vytvořit skupinu
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateGroup;