import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../store/AuthContext';
import useWebSocket from '../hooks/useWebSocket';
import { chatService } from '../api/chatService';
import { userService } from '../api/userService';
import { socialService } from '../api/socialService';
import { adminService } from '../api/adminService';
import Profile from '../components/Profile';
import CreateGroup from '../components/CreateGroup';
import GroupInfo from '../components/GroupInfo';
import Friends from '../components/Friends';
import AdminDashboard from './AdminDashboard';

function ChatDashboard() {
    const { user, logout } = useAuth();
    const [currentMessage, setCurrentMessage] = useState('');
    const [showAdmin, setShowAdmin] = useState(false);

    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isGroupOpen, setIsGroupOpen] = useState(false);
    const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const [isFriendsOpen, setIsFriendsOpen] = useState(false);
    const [sentRequests, setSentRequests] = useState(new Set());
    const [friendRequests, setFriendRequests] = useState([]);

    const [selectedImage, setSelectedImage] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);

    const emojis = ['😀', '😂', '🥰', '😎', '🤔', '😭', '😡', '👍', '❤️', '🎉'];

    const [notifications, setNotifications] = useState({
      friendRequests: 0
    });

    const handleNewMessage = (msg) => {
        if (activeChat && msg.chat_id === activeChat.id) {
            setMessages(prev => [...prev, msg]);
        }
        // Zde by mohla být logika pro ztučnění nepřečteného chatu v levém panelu
    };

    const handleNewFriendRequest = (req) => {
        setFriendRequests(prev => [...prev, req]);
        setNotifications(prev => ({ ...prev, friendRequests: prev.friendRequests + 1 }));
    };

    const handleSystemAction = (actionData) => {
        if (actionData.action === 'FORCE_LOGOUT') {
            alert(`Byl jsi odpojen administrátorem: ${actionData.reason}`);
            logout();
        }
    };

    const { sendMessage } = useWebSocket(user, handleNewMessage, handleNewFriendRequest, handleSystemAction);

    //načítání po přihlášení
    useEffect(() => {
        const fetchData = async () => {
            try {
                const chatData = await chatService.getConversations();
                setConversations(chatData || []);
                
                const initialRequests = await socialService.getPendingRequests();
                setFriendRequests(initialRequests || []);
                setNotifications({ friendRequests: initialRequests?.length || 0 });
            } catch (error) {
                console.error("Chyba při inicializaci Dashboardu:", error);
            }
        };
        fetchData();
    }, []);

  //Funkce, která se spustí při každém napsaném písmenku do vyhledávání
    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        const results = await userService.searchUsers(query);
        setSearchResults(results);
    };

    //Funkce pro odeslání žádosti z vyhledávání
    const handleSendFriendRequest = async (e, userId) => {
        e.stopPropagation();
        const result = await socialService.sendFriendRequest(userId);
        if (result.success) {
            setSentRequests(prev => new Set(prev).add(userId));
        }
    };

    const handleChatSelect = async (chat) => {
        setActiveChat(chat);
        const history = await chatService.getMessages(chat.id);
        setMessages(history);
    };

    const handleStartNewChat = async (foundUser) => {
      const newChat = await chatService.createConversation(foundUser.id, foundUser.username);
      if (newChat) {
        setConversations(prev => [newChat, ...prev]); //Vytvoření nového chatu na začátek koverzací
        setActiveChat(newChat); //Hned se nastaví jako aktivní
        setMessages([]);
        setSearchQuery('');
      }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl); // Ukládáme pro náhled
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!currentMessage.trim() && !selectedImage) return;

        try {
            await chatService.sendMessage(activeChat.id, currentMessage, selectedImage);
            
            setCurrentMessage('');
            setSelectedImage(null);
            setShowEmojiPicker(false);
        } catch (error) {
            console.error('Chyba při odesílání zprávy:', error);
            alert('Zprávu se nepodařilo odeslat.');
        }
    };

    if (showAdmin) {
        return <AdminDashboard onBack={() => setShowAdmin(false)} sendWebSocketMessage={sendMessage} />;
    }

    return (
      <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* LEVÝ PANEL */}
      <div className="w-1/4 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-300 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">ChatApp</h2>
            <p className="text-xs text-gray-600">Přihlášen: {user?.username}</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setShowAdmin(true)} className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition font-medium">Admin</button>
            <button onClick={() => setIsFriendsOpen(true)} className="relative text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition font-medium">
              Přátelé
              {notifications.friendRequests > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  {notifications.friendRequests}
                </span>
              )}
            </button>
            <button onClick={() => setIsProfileOpen(true)} className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition">Profil</button>
            <button onClick={logout} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Odhlásit</button>
          </div>
        </div>

        <div className="p-3 border-b border-gray-200 flex space-x-2">
          <input 
            type="text" placeholder="Hledat uživatele..." value={searchQuery} onChange={handleSearch}
            className="flex-1 p-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
          <button onClick={() => setIsGroupOpen(true)} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center w-10">
            <span className="text-xl font-bold leading-none">+</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {searchQuery.trim() !== '' ? (
            searchResults.length === 0 ? <p className="text-center text-gray-400 text-sm mt-4">Nenalezen žádný uživatel</p> : 
            searchResults.map(foundUser => {
                const isSent = sentRequests.has(foundUser.id);
                return (
                  <div key={`search-${foundUser.id}`} className="p-3 rounded flex justify-between items-center bg-green-50 border border-green-200 transition mb-1">
                    <span className="font-semibold text-green-800">{foundUser.username}</span>
                    <button 
                      onClick={(e) => handleSendFriendRequest(e, foundUser.id)} disabled={isSent}
                      className={`text-xs font-bold px-3 py-1.5 rounded transition shadow-sm ${isSent ? 'bg-gray-300 text-gray-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                    >
                      {isSent ? 'Odesláno' : '+ Přidat'}
                    </button>
                  </div>
                );
            })
          ) : (
            conversations.length === 0 ? <p className="text-center text-gray-400 text-sm mt-4">Žádné konverzace</p> : 
            conversations.map(chat => (
                <div 
                  key={chat.id} onClick={() => handleChatSelect(chat)}
                  className={`p-3 rounded cursor-pointer flex justify-between items-center transition ${activeChat?.id === chat.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  <span className="font-semibold">{chat.name}</span>
                </div>
            ))
          )}
        </div>
      </div>

      {/* PRAVÝ PANEL (ZPRÁVY) */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeChat ? (
          <>
            <div className="p-4 border-b border-gray-300 bg-white shadow-sm flex justify-between items-center">
              <h2 className="font-bold text-lg">{activeChat.name}</h2>
              {activeChat.is_group && (
                <button onClick={() => setIsGroupInfoOpen(true)} className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-200 transition">Správa skupiny</button>
              )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">Zatím tu nejsou žádné zprávy. Napište jako první!</div>
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.sender_id === user.id; 
                  return (
                    <div key={index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`p-3 rounded-lg max-w-md shadow-sm relative ${isMine ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                        {msg.image && <img src={msg.image} alt="Obrázek" className="rounded mb-2 max-w-full h-auto max-h-48 object-cover" />}
                        {msg.content && <span>{msg.content}</span>}
                        
                        {/* Indikátor času a přečtení (zobrazí se jen u tvých zpráv) */}
                        {isMine && (
                          <div className="text-[10px] text-blue-200 text-right mt-1 font-bold">
                            {msg.is_read ? '✓✓ Přečteno' : '✓ Odesláno'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-white border-t border-gray-300 flex flex-col">
              {selectedImage && (
                <div className="mb-3 relative inline-block">
                  <img src={selectedImage} alt="Náhled" className="h-20 w-20 object-cover rounded border border-gray-300 shadow-sm" />
                  <button type="button" onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md hover:bg-red-600">&times;</button>
                </div>
              )}

              <div className="flex space-x-2 items-center relative">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition text-xl">📎</button>
                
                <div className="relative">
                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition text-xl">😀</button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-2 w-48 z-10">
                      {emojis.map((emoji, idx) => (
                        <span key={idx} onClick={() => setCurrentMessage(prev => prev + emoji)} className="cursor-pointer hover:bg-gray-100 p-1 rounded text-center text-xl transition">{emoji}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                <form onSubmit={handleSendMessage} className="flex-1 flex space-x-2">
                  <input type="text" value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} placeholder="Napiš zprávu..." className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                  <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition shadow-sm">Odeslat</button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <p className="text-lg">Vyberte konverzaci z levého panelu</p>
          </div>
        )}
      </div>

      {/* MODÁLNÍ OKNA */}
      {isProfileOpen && <Profile onClose={() => setIsProfileOpen(false)} />}
      {isGroupOpen && <CreateGroup onClose={() => setIsGroupOpen(false)} onCreate={(newGroup) => { setConversations(prev => [newGroup, ...prev]); setActiveChat(newGroup); setMessages([]); }} />}
      {isGroupInfoOpen && activeChat && <GroupInfo chat={activeChat} onClose={() => setIsGroupInfoOpen(false)} onLeave={(chatId) => { setConversations(prev => prev.filter(c => c.id !== chatId)); setActiveChat(null); }} />}
      {isFriendsOpen && <Friends onClose={() => setIsFriendsOpen(false)} requests={friendRequests} setRequests={setFriendRequests} />}
    </div>
  );
}
export default ChatDashboard;