import { useState, useEffect } from 'react';
import { socialService } from '../api/socialService';

function Friends({ onClose, requests, setRequests }) {
    const [activeTab, setActiveTab] = useState('friends');
    const [friends, setFriends] = useState([]);
  
    useEffect(() => {
      const loadData = async () => {
        const friendsData = await socialService.getFriends();
        setFriends(friendsData);
      };
      if (activeTab === 'friends') loadData();
    }, [activeTab]);

    const handleResponse = async (id, accept) => {
      const result = await socialService.respondToRequest(id, accept);
      if (result.success) {
        setRequests(prev => prev.filter(r => r.id !== id));
        if (accept) {
          const updatedFriends = await socialService.getFriends();
          setFriends(updatedFriends);
        }
      }
    };

    const handleBlock = async (userId) => {
      if(window.confirm("Zablokovat tohoto uživatele?")) {
        const result = await socialService.blockUser(userId);
        if (result.success) {
          setFriends(prev => prev.filter(f => f.id !== userId));
        }
      }
    };

    const handleReport = async (userId) => {
      if(window.confirm("Opravdu chcete tohoto uživatele nahlásit administrátorům?")) {
        await socialService.reportUser(userId);
        alert("Uživatel byl nahlášen.");
      }
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] h-[600px] flex flex-col overflow-hidden relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold z-10">&times;</button>
        
        <div className="flex bg-gray-100 border-b">
          <button onClick={() => setActiveTab('friends')} className={`flex-1 py-4 font-semibold text-sm ${activeTab === 'friends' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}>Přátelé</button>
          <button onClick={() => setActiveTab('requests')} className={`flex-1 py-4 font-semibold text-sm relative ${activeTab === 'requests' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}>
            Žádosti
            {requests.length > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{requests.length}</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {activeTab === 'friends' && (
            <div className="space-y-2">
              {friends.length === 0 ? <p className="text-center text-gray-500 mt-10">Zatím nemáte žádné přátele.</p> : 
                friends.map(friend => (
                  <div key={friend.id} className="bg-white p-3 rounded shadow-sm border flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{friend.username}</span>
                    <div className="space-x-2">
                      <button onClick={() => handleBlock(friend.id)} className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 font-bold">Blokovat</button>
                      <button onClick={() => handleReport(friend.id)} className="text-xs bg-yellow-100 text-yellow-600 px-3 py-1 rounded hover:bg-yellow-200 font-bold">Nahlásit</button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-2">
              {requests.length === 0 ? <p className="text-center text-gray-500 mt-10">Žádné nové žádosti o přátelství.</p> : 
                requests.map(req => (
                  <div key={req.id} className="bg-white p-3 rounded shadow-sm border flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{req.fromUser?.username || 'Neznámý'}</span>
                    <div className="space-x-2">
                      <button onClick={() => handleResponse(req.id, true)} className="text-xs bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 font-bold shadow-sm">Přijmout</button>
                      <button onClick={() => handleResponse(req.id, false)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-300 font-bold">Odmítnout</button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Friends;