import { useState } from "react";
import { useAuth } from "../store/AuthContext";
import userService from "../api/userService";
import ChatAvatar from "./ChatAvatar";
import UserStatus from "./UserStatus";

function Profile({ onClose }) {
    const { user, setUser } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [bio, setBio] = useState(user.profile?.bio || ''); // PŘIDÁNO
    const [password, setPassword] = useState('');
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
    const [oldPassword, setOldPassword] = useState('');


    const handleSave = async (e) => {
        e.preventDefault();
        setStatusMsg({ text: 'Ukládám...', type: 'info' });

        try {
            const updateRes = await userService.updateProfile({ username, email, profile: {bio: bio} });
            if (!updateRes.success) {
              throw new Error(updateRes.message);
            }

            setUser(updateRes.data);

            if (password.trim() !== '' || oldPassword.trim() !== '') {
              if (!oldPassword.trim() || !password.trim()) {
                throw new Error("Pro změnu hesla vyplňte staré i nové heslo.");
              }
              const passwordRes = await userService.changePassword(oldPassword, password);
              if (!passwordRes.success) {
                throw new Error(passwordRes.message);
              }
              setOldPassword('');
              setPassword('');
            }

            setStatusMsg({ text: 'Profil byl úspěšně aktualizován!', type: 'success' });
            setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Chyba aktualizace:', error);
            setStatusMsg({ text: error.message || 'Při ukládání došlo k chybě.', type: 'error' });
        }
    };

  const previewName = username.trim() || user?.username || "Uživatel";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="relative w-full max-w-md rounded-3xl border border-violet-100 bg-white shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 text-xl font-bold text-violet-300 transition hover:text-violet-700">
          &times;
        </button>

        <div className="border-b border-violet-100 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">Můj profil</p>
          <h2 className="mt-1 text-2xl font-bold text-violet-900">Nastavení profilu</h2>
        </div>

        <div className="border-b border-violet-100 px-6 py-5">
          <div className="flex items-center gap-4 rounded-3xl bg-violet-50 px-4 py-4">
            <ChatAvatar username={previewName} size="lg" />

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-violet-900">{previewName}</p>
              <UserStatus status={user?.status || user?.profile?.status || "offline"} />
              <p className="mt-1 truncate text-xs text-violet-400">{email || "Bez e-mailu"}</p>
            </div>
          </div>
        </div>

        {statusMsg.text && (
          <div className={`mx-6 mt-5 rounded-2xl px-4 py-3 text-center text-sm font-semibold ${
            statusMsg.type === "error"
              ? "bg-rose-50 text-rose-600"
              : statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-violet-50 text-violet-600"
          }`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-semibold text-violet-900">Uživatelské jméno</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3 text-sm text-violet-900 outline-none transition placeholder:text-violet-300 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-violet-900">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3 text-sm text-violet-900 outline-none transition placeholder:text-violet-300 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-violet-900">O mně</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Napište něco o sobě..." className="h-20 w-full resize-none rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3 text-sm text-violet-900 outline-none transition placeholder:text-violet-300 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100" />
          </div>

          <div className="border-t border-violet-100 pt-4">
            <label className="mb-1 block text-sm font-semibold text-violet-900"> Staré heslo</label>
            <input type="password" placeholder="Vyplň jen při změně hesla" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3 text-sm text-violet-900 outline-none transition placeholder:text-violet-300 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"/>
          </div>

          <div className="border-t border-violet-100 pt-4">
            <label className="mb-1 block text-sm font-semibold text-violet-900">Nové heslo</label>
            <input type="password" placeholder="Nechte prázdné pro zachování" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-4 py-3 text-sm text-violet-900 outline-none transition placeholder:text-violet-300 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-2xl bg-violet-50 px-5 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100">
              Zrušit
            </button>

            <button type="submit" className="rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-violet-600 hover:shadow-lg">
              Uložit změny
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;