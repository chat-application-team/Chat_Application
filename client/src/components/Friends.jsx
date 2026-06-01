import { useState, useEffect } from 'react';
import { socialService } from '../api/socialService';

function Friends({ onClose, requests, setRequests }) {
    const [activeTab, setActiveTab] = useState('friends');
    const [friends, setFriends] = useState([]);
  
    const [blockedUsers, setBlockedUsers] = useState([]);

    useEffect(() => {
        const loadSocialData = async () => {
            try {
                const fetchedFriends = await socialService.getFriends();
                console.log("Stažení přátelé v Modálu:", fetchedFriends);
                setFriends(fetchedFriends || []);
            } catch (error) {
                console.error("Chyba načítání přátel:", error);
            }
        };
        loadSocialData();
    }, []);

    const handleAcceptRequest = async (req) => {
        await socialService.respondToRequest(req.id, true);
        setRequests(prev => prev.filter(r => r.id !== req.id));
        setFriends(prev => [...prev, { id: req.fromUser.id, username: req.fromUser.username, status: 'online' }]);
    };

    const handleRejectRequest = async (reqId) => {
        await socialService.respondToRequest(reqId, false);
        setRequests(prev => prev.filter(r => r.id !== reqId)); 
    };

    const handleBlockUser = async (userToBlock) => {
        await socialService.blockUser(userToBlock.id);
        
        setFriends(prev => prev.filter(f => f.id !== userToBlock.id));
        setBlockedUsers(prev => [...prev, userToBlock]);
    };

    const handleUnblockUser = async (user) => {
        await socialService.unblockUser(user.id);
        setBlockedUsers(prev => prev.filter(u => u.id !== user.id));
        setFriends(prev => [...prev, user]);
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl relative flex flex-col min-h-[400px] max-h-[80vh]">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold">
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Centrum přátel</h2>

        <div className="flex space-x-4 border-b border-gray-200 mb-4">
          <button onClick={() => setActiveTab('friends')} className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'friends' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
            Moji přátelé
          </button>
          
          <button onClick={() => setActiveTab('requests')} className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'requests' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
            Žádosti
            {/* Tady už se používá to sdílené číslo */}
            {requests.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </button>
          
          <button onClick={() => setActiveTab('blocked')} className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'blocked' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
            Zablokovaní
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'friends' && (
            <div className="space-y-2">
              {friends.length === 0 ? (
                <p className="text-gray-400 text-sm text-center mt-8">Zatím nemáš žádné přátele.</p>
              ) : (
                friends.map(f => (
                  <div key={`friend-${f.id}`} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${f.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className="font-medium text-gray-800">{f.username}</span>
                    </div>
                    <button onClick={() => handleBlockUser(f)} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1">
                      Blokovat
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-2">
              {requests.length === 0 ? (
                <p className="text-gray-400 text-sm text-center mt-8">Žádné nové žádosti o přátelství.</p>
              ) : (
                requests.map(req => (
                  <div key={`req-${req.id}`} className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-100">
                    <span className="font-medium text-blue-900">{req.fromUser.username}</span>
                    <div className="flex space-x-2">
                      <button onClick={() => handleAcceptRequest(req)} className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 shadow-sm transition">Přijmout</button>
                      <button onClick={() => handleRejectRequest(req.id)} className="px-3 py-1 bg-gray-300 text-gray-700 text-xs font-bold rounded hover:bg-gray-400 shadow-sm transition">Odmítnout</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'blocked' && (
            <div className="space-y-2">
              {blockedUsers.length === 0 ? (
                <p className="text-gray-400 text-sm text-center mt-8">Zatím jsi nikoho nezablokoval.</p>
              ) : (
                blockedUsers.map(user => (
                  <div key={`blocked-${user.id}`} className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-100">
                    <span className="font-medium text-red-900">{user.username || 'Neznámý'}</span>
                    <button onClick={() => handleUnblockUser(user)} className="text-xs bg-white text-gray-700 border border-gray-300 px-2 py-1 rounded hover:bg-gray-100 transition shadow-sm">
                      Odblokovat
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Friends;