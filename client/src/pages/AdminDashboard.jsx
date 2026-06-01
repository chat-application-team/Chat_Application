import { useState, useEffect } from 'react';
//import axiosClient from '../api/axiosClient';

function AdminDashboard({ onBack, sendWebSocketMessage }) {
    const [activeTab, setActiveTab] = useState('users');

    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalGroups: 0, bannedUsers: 0 });

    //temp
    useEffect(() => {
        setUsers([
            { id: 1, username: 'admin_user', role: 'admin', status: 'online' },
            { id: 2, username: 'KarelGamer', role: 'user', status: 'offline' },
            { id: 3, username: 'Spammer123', role: 'user', status: 'banned' },
        ]);
        setGroups([
            { id: 101, name: 'Projektování', members: 4, createdAt: '2026-05-10' },
            { id: 102, name: 'Hráči D&D', members: 6, createdAt: '2026-05-12' },
        ]);
        setStats({ totalUsers: 3, activeGroups: 2, bannedUsers: 1 });
    }, []);

    /*backend
    useEffect(() => {
        const loadAdminData = async () => {
            try {
                const fetchedUsers = await adminService.getAllUsers();
                const fetchedGroups = await adminService.getAllGroups();
                const fetchedStats = await adminService.getSystemStats();
                
                setUsers(fetchedUsers);
                setGroups(fetchedGroups);
                setStats(fetchedStats);
            } catch (error) {
                console.error("Chyba při načítání dat pro administraci:", error);
            }
        };
        loadAdminData();
    }, []);*/

    // Funkce pro banování/odbanování uživatele
    const handleBanUser = async (id) => {
        const user = users.find(u => u.id === id);
        const newStatus = user.status === 'banned' ? 'offline' : 'banned';

        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
        setStats(prev => ({ 
            ...prev, 
            bannedUsers: newStatus === 'banned' ? prev.bannedUsers + 1 : prev.bannedUsers - 1 
        }));
            
        // Pokud ho banujeme, pošleme serveru signál, ať ho okamžitě odpojí
        if (newStatus === 'banned' && sendWebSocketMessage) {
            sendWebSocketMessage({
                type: 'SYSTEM_ACTION',
                action: 'FORCE_LOGOUT',
                targetUserId: id,
                reason: 'Porušení pravidel serveru.'
            });
        }
            
            /*backend
        try {
            if (newStatus === 'banned') {
                await adminService.banUser(id);
            } else {
                await adminService.unbanUser(id);
            }
        } catch (error) {
            console.error("Chyba při změně banu:", error);
        }*/
    };

    // Smazání skupiny administrátorem
    const handleDeleteGroup = async (id) => {
        //temp
        setGroups(groups.filter(g => g.id !== id));
        setStats(prev => ({ ...prev, activeGroups: prev.activeGroups - 1 }));

        /*backend
        try {
            await adminService.deleteGroup(id);
            } catch (error) {
            console.error("Chyba při mazání skupiny:", error);
        }*/
    };

    return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* BOČNÍ MENU ADMINISTRACE */}
      <div className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-blue-400">Admin Panel</h2>
          <p className="text-xs text-slate-400">Správa systému</p>
        </div>

        <div className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`w-full text-left p-2 rounded transition ${activeTab === 'stats' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
          >
            📊 Statistiky
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full text-left p-2 rounded transition ${activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
          >
            👥 Uživatelé
          </button>
          <button 
            onClick={() => setActiveTab('groups')}
            className={`w-full text-left p-2 rounded transition ${activeTab === 'groups' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
          >
            💬 Skupiny
          </button>
        </div>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={onBack}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white p-2 rounded transition flex items-center justify-center font-bold"
          >
            ← Zpět do chatu
          </button>
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
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Uživatel</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 text-gray-500">{u.id}</td>
                      <td className="p-4 font-medium text-gray-800">{u.username}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-bold ${u.status === 'banned' ? 'bg-red-100 text-red-700' : u.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleBanUser(u.id)} className={`px-3 py-1 text-xs font-bold rounded text-white ${u.status === 'banned' ? 'bg-gray-500 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}>
                            {u.status === 'banned' ? 'Odbanovat' : 'Zabanovat'}
                          </button>
                        )}
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
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Název</th>
                    <th className="p-4 font-semibold">Členů</th>
                    <th className="p-4 font-semibold text-right">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map(g => (
                    <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 text-gray-500">{g.id}</td>
                      <td className="p-4 font-medium text-gray-800">{g.name}</td>
                      <td className="p-4 text-gray-600">{g.members}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteGroup(g.id)} className="px-3 py-1 text-xs font-bold rounded text-white bg-red-500 hover:bg-red-600">
                          Smazat skupinu
                        </button>
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