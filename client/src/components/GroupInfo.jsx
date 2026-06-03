import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import ChatAvatar from './ChatAvatar';

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
              onChange={(e) => setNewMember(e.target.value)}
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