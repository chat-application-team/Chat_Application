import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../store/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { chatService } from '../api/chatService';
import { userService } from '../api/userService';
import { socialService } from '../api/socialService';
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
    const fileInputRef = useRef(null); //Reference pro skrytý input na soubory

    const emojis = ['😀', '😂', '🥰', '😎', '🤔', '😭', '😡', '👍', '❤️', '🎉'];

    const [notifications, setNotifications] = useState({
      friendRequests: 0,
      messages: 0
    });

    //websocket handlery
    const handleNewMessage = (msg) => setMessages(prev => [...prev, msg]);

    const handleNewFriendRequest = (req) => {
      setFriendRequests(prev => [...prev, req]);
      setNotifications(prev => ({ ...prev, friendRequests: prev.friendRequests + 1 }));
    };

    const handleSystemAction = (actionData) => {
      if (actionData.action === 'FORCE_LOGOUT') {
        alert(`Byl jsi odpojen administrátorem: ${actionData.reason}`);
        logout(); // Vykopne uživatele do loginu
      }
    };

    const { sendMessage } = useWebSocket(user, handleNewMessage, handleNewFriendRequest, handleSystemAction);

    //načítání konverzací při načtení komponenty
    useEffect(() => {
      const fetchData = async () => {
        try {
          const chatData = await chatService.getConversations();
          setConversations(chatData || []);
          
          const initialRequests = await socialService.getPendingRequests();
          console.log("Stažené žádosti v Dashboardu:", initialRequests);
          setFriendRequests(initialRequests || []);
        } catch (error) {
          console.error("Chyba při načítání dat:", error);
        }
      };
      fetchData();
    }, []);

  //Funkce, která se spustí při každém napsaném písmenku do vyhledávání
    const handleSearch = async (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      if (query.trim()) {
        const results = await userService.searchUsers(query);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };

    //Funkce pro odeslání žádosti z vyhledávání
    const handleSendFriendRequest = async (e, userId) => {
      e.stopPropagation();

      //temp
      console.log("Posílám žádost o přátelství pro ID:", userId);
      setSentRequests(prev => new Set(prev).add(userId)); 

      /*backend
      try {
        await socialService.sendFriendRequest(userId);
        setSentRequests(prev => new Set(prev).add(userId));
      } catch (error) {
        console.error("Chyba při odesílání žádosti:", error);
      }*/
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
        setSelectedImage(imageUrl);
      }
    };

    const handleSendMessage = (e) => {
      e.preventDefault();
      if (!currentMessage.trim() && !selectedImage) return;

      const newMessage = {
        type: 'CHAT_MESSAGE',
        chatId: activeChat?.id,
        senderId: user?.id,
        text: currentMessage,
        image: selectedImage
      };

      //temp
      setMessages(prev => [...prev, { ...newMessage, isMine: true }]);

      /*backend
      try {
        sendMessage(newMessage); 
        //nebo pokud chceš nejdřív poslat na backend a pak přes WS:
        await chatService.sendMessage(newMessage);
      } catch (error) {
        console.error('Chyba při odesílání zprávy:', error);
      }*/

      setCurrentMessage('');
      setSelectedImage(null);
      setShowEmojiPicker(false); 
    };

    if (showAdmin) {
      return (
        <AdminDashboard 
          onBack={() => setShowAdmin(false)} 
          sendWebSocketMessage={sendMessage}
        />
      );
    }

    return (
      <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* --- LEVÝ PANEL --- */}
      <div className="w-1/4 bg-white border-r border-gray-300 flex flex-col">
        
        {/* Hlavička */}
        <div className="p-4 border-b border-gray-300 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">ChatApp</h2>
            <p className="text-xs text-gray-600">Přihlášen: {user?.username || 'Uživatel'}</p>
          </div>
          <div className="flex space-x-2">
            {/*if (user.role === 'admin') {*/}
            <button 
              onClick={() => setShowAdmin(true)} 
              className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition font-medium"
            >
              Admin
            </button>
            <button 
              onClick={() => setIsFriendsOpen(true)} 
              className="relative text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition font-medium"
            >
              Přátelé
              {friendRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  {friendRequests.length}
                </span>
              )}
            </button>
            <button onClick={() => setIsProfileOpen(true)} className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition">Profil</button>
            <button onClick={logout} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Odhlásit</button>
          </div>
        </div>

        {/* Vyhledávací políčko a nová skupina */}
        <div className="p-3 border-b border-gray-200 flex space-x-2">
          <input 
            type="text" 
            placeholder="Hledat uživatele..." 
            value={searchQuery}
            onChange={handleSearch}
            className="flex-1 p-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
          <button 
            onClick={() => setIsGroupOpen(true)}
            title="Vytvořit novou skupinu"
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center w-10"
          >
            <span className="text-xl font-bold leading-none">+</span>
          </button>
        </div>

        {/* Seznam chatů / Výsledky hledání */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {searchQuery.trim() !== '' ? (
            searchResults.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-4">Nenalezen žádný uživatel</p>
            ) : (
              searchResults.map(foundUser => {
                const isSent = sentRequests.has(foundUser.id);
                return (
                  <div key={`search-${foundUser.id}`} className="p-3 rounded flex justify-between items-center bg-green-50 border border-green-200 transition mb-1">
                    <span className="font-semibold text-green-800">{foundUser.username}</span>
                    <button 
                      onClick={(e) => handleSendFriendRequest(e, foundUser.id)}
                      disabled={isSent}
                      className={`text-xs font-bold px-3 py-1.5 rounded transition shadow-sm ${
                        isSent 
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {isSent ? 'Odesláno' : '+ Přidat'}
                    </button>
                  </div>
                );
              })
            )
          ) : (
            conversations.length === 0 ? (
               <p className="text-center text-gray-400 text-sm mt-4">Žádné konverzace</p>
            ) : (
              conversations.map(chat => (
                <div 
                  key={chat.id} 
                  onClick={() => handleChatSelect(chat)}
                  className={`p-3 rounded cursor-pointer flex justify-between items-center transition ${
                    activeChat?.id === chat.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-semibold">{chat.name}</span>
                  {chat.unread_count > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* --- PRAVÝ PANEL --- */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeChat ? (
          <>
            {/* Hlavička chatu */}
            <div className="p-4 border-b border-gray-300 bg-white shadow-sm flex justify-between items-center">
              <h2 className="font-bold text-lg">{activeChat.name}</h2>
              {activeChat.is_group && (
                <button 
                  onClick={() => setIsGroupInfoOpen(true)}
                  className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-200 transition"
                >
                  Správa skupiny
                </button>
              )}
            </div>

            {/* Výpis zpráv */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Zatím tu nejsou žádné zprávy. Napište jako první!
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-lg max-w-md shadow-sm ${msg.isMine ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                      {msg.image && <img src={msg.image} alt="Odeslaný obrázek" className="rounded mb-2 max-w-full h-auto max-h-48 object-cover" />}
                      {msg.text && <span>{msg.text || msg.content}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Panel pro psaní zpráv */}
            <div className="p-4 bg-white border-t border-gray-300 flex flex-col">
              {selectedImage && (
                <div className="mb-3 relative inline-block">
                  <img src={selectedImage} alt="Náhled" className="h-20 w-20 object-cover rounded border border-gray-300 shadow-sm" />
                  <button type="button" onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md hover:bg-red-600">
                    &times;
                  </button>
                </div>
              )}

              <div className="flex space-x-2 items-center relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden" 
                />
                
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()} 
                  title="Nahrát obrázek" 
                  className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition text-xl"
                >
                  📎
                </button>
                
                <div className="relative">
                  <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                    title="Přidat Emoji" 
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition text-xl"
                  >
                    😀
                  </button>
                  
                  {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-2 w-48 z-10">
                      {emojis.map((emoji, idx) => (
                        <span 
                          key={idx} 
                          onClick={() => setCurrentMessage(prev => prev + emoji)}
                          className="cursor-pointer hover:bg-gray-100 p-1 rounded text-center text-xl transition"
                        >
                          {emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <form onSubmit={handleSendMessage} className="flex-1 flex space-x-2">
                  <input 
                    type="text" 
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Napiš zprávu..." 
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition shadow-sm">
                    Odeslat
                  </button>
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

      {isProfileOpen && <Profile onClose={() => setIsProfileOpen(false)} />}
      
      {isGroupOpen && (
        <CreateGroup 
          onClose={() => setIsGroupOpen(false)} 
          onCreate={(newGroup) => { 
            setConversations(prev => [newGroup, ...prev]); 
            setActiveChat(newGroup); 
            setMessages([]); 
          }} 
        />
      )}
      
      {isGroupInfoOpen && activeChat && (
        <GroupInfo 
          chat={activeChat} 
          onClose={() => setIsGroupInfoOpen(false)} 
          onLeave={(chatId) => { 
            setConversations(prev => prev.filter(c => c.id !== chatId)); 
            setActiveChat(null); 
          }} 
        />
      )}
      
      {isFriendsOpen && (
      <Friends 
        onClose={() => setIsFriendsOpen(false)} 
        requests={friendRequests}
        setRequests={setFriendRequests}
      />
    )}
    </div>
  );
}

export default ChatDashboard;