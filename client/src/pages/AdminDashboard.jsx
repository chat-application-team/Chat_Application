import { useState, useEffect } from 'react';
import { adminService } from '../api/adminService';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('users');

    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, activeGroups: 0, bannedUsers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAdminData = async () => {
            try {
                const fetchedStats = await adminService.getSystemStats();
                const fetchedUsers = await adminService.getAllUsers();
                const fetchedGroups = await adminService.getAllGroups();
                
                setStats({
                    totalUsers: fetchedStats?.total_users || fetchedUsers.length,
                    activeGroups: fetchedStats?.total_groups || fetchedGroups.length,
                    bannedUsers: fetchedUsers.filter(u => u.status === 'banned' || u.is_active === false).length
                });
                setUsers(fetchedUsers);
                setGroups(fetchedGroups);
            } catch (error) {
                console.error("Chyba při načítání dat pro administraci:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAdminData();
    }, []);

    const handleBanUser = async (id) => {
        if(window.confirm("Opravdu chcete zabanovat tohoto uživatele?")) {
            try {
                await adminService.banUser(id);
            
                setUsers(users.map(u => u.id === id ? { ...u, status: 'banned', is_active: false } : u));
                setStats(prev => ({ ...prev, bannedUsers: prev.bannedUsers + 1 }));
            
                if (sendWebSocketMessage) {
                    sendWebSocketMessage({
                        type: 'SYSTEM_ACTION',
                        action: 'FORCE_LOGOUT',
                        targetUserId: id,
                        reason: 'Porušení pravidel serveru.'
                    });
                }
            } catch (error) {
                alert("Nepodařilo se zabanovat uživatele. Zkontrolujte připojení k serveru.");
            }
        }
    };

    const handleDeleteGroup = async (id) => {
        if(window.confirm("Opravdu chcete nenávratně smazat tuto skupinu?")) {
            try {
                await adminService.deleteGroup(id);
                
                setGroups(groups.filter(g => g.id !== id));
                setStats(prev => ({ ...prev, activeGroups: prev.activeGroups - 1 }));
            } catch (error) {
                alert("Nepodařilo se smazat skupinu.");
            }
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-gray-100 text-xl font-bold text-gray-500">Načítám systémová data...</div>;

    return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* BOČNÍ MENU ADMINISTRACE */}
      <div className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-blue-400">Admin Panel</h2>
        </div>
        <div className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('stats')} className={`w-full text-left p-2 rounded transition ${activeTab === 'stats' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>📊 Statistiky</button>
          <button onClick={() => setActiveTab('users')} className={`w-full text-left p-2 rounded transition ${activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>👥 Uživatelé</button>
          <button onClick={() => setActiveTab('groups')} className={`w-full text-left p-2 rounded transition ${activeTab === 'groups' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>💬 Skupiny</button>
        </div>
        <div className="p-4 border-t border-slate-700">
          <button onClick={onBack} className="w-full bg-slate-700 hover:bg-slate-600 text-white p-2 rounded font-bold transition">← Zpět do chatu</button>
        </div>
      </div>

      {/* HLAVNÍ OBSAH */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
        
        {/* ZÁLOŽKA: STATISTIKY */}
        {activeTab === 'stats' && (
          <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Přehled systému</h1>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-gray-500 text-sm font-bold uppercase">Celkem uživatelů</h3>
                <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-gray-500 text-sm font-bold uppercase">Aktivní skupiny</h3>
                <p className="text-4xl font-bold text-green-600 mt-2">{stats.activeGroups}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-gray-500 text-sm font-bold uppercase">Zabanovaní</h3>
                <p className="text-4xl font-bold text-red-600 mt-2">{stats.bannedUsers}</p>
              </div>
            </div>
          </div>
        )}

        {/* ZÁLOŽKA: UŽIVATELÉ */}
        {activeTab === 'users' && (
          <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Správa uživatelů</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 text-sm uppercase">
                    <th className="p-4 font-semibold">Uživatel</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold text-right">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-800">{u.username}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-bold ${u.is_superuser ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'}`}>
                          {u.is_superuser ? 'Admin' : 'Uživatel'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {/* Zobrazíme tlačítko jen pokud není admin a ještě není zabanovaný */}
                        {!u.is_superuser && u.status !== 'banned' && u.is_active !== false ? (
                          <button onClick={() => handleBanUser(u.id)} className="px-3 py-1 text-xs font-bold rounded text-white bg-red-500 hover:bg-red-600 transition shadow-sm">Zabanovat</button>
                        ) : !u.is_superuser ? (
                          <span className="text-xs font-bold text-red-500">Zabanován</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ZÁLOŽKA: SKUPINY */}
        {activeTab === 'groups' && (
          <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Správa skupin</h1>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 text-sm uppercase">
                    <th className="p-4 font-semibold">Název</th>
                    <th className="p-4 font-semibold text-right">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map(g => (
                    <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-800">{g.name}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteGroup(g.id)} className="px-3 py-1 text-xs font-bold rounded text-white bg-red-500 hover:bg-red-600 transition shadow-sm">Smazat skupinu</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;