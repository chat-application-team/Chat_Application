import { useState, useEffect, useRef } from "react";
import { useAuth } from "../store/AuthContext";
import useWebSocket from "../hooks/useWebsocket"
import { chatService } from "../api/chatService";
import { userService } from "../api/userService";
import { socialService } from "../api/socialService";
import Profile from "../components/Profile";
import CreateGroup from "../components/CreateGroup";
import GroupInfo from "../components/GroupInfo";
import Friends from "../components/Friends";
import AdminDashboard from "./AdminDashboard";

import MessageBubble from "../components/MessageBubble";
import AppHeader from "../components/AppHeader";
import ConversationItem from "../components/ConversationItem";
import ChatHeader from "../components/ChatHeader";
import MessageInput from "../components/MessageInput";
import SearchUserItem from "../components/SearchUserItem";

function ChatDashboard() {
  const { user, setUser, logout } = useAuth();
  const [currentMessage, setCurrentMessage] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);

  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [friendRequests, setFriendRequests] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const emojis = ["😀", "😂", "🥰", "😎", "🤔", "😭", "😡", "👍", "❤️", "🎉"];

  const [notifications, setNotifications] = useState({
    friendRequests: 0,
  });

  const normalizePrivateChat = (chat, foundUser) => ({
    ...chat,
    name: foundUser.username,
    avatar: foundUser.profile?.avatar,
    status: foundUser.status || foundUser.profile?.status || "offline",
    other_user_id: foundUser.id,
    is_group: false,
  });

    const handleNewMessage = (data) => {
      const msg = data.message || data;

      const messageChatId =
        msg.chat_id ||
        msg.chat ||
        activeChat?.id;

      if (activeChat && Number(messageChatId) === Number(activeChat.id)) {
        setMessages(prev => [...prev, msg]);
      }
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

    const { sendMessage } = useWebSocket(user, activeChat?.id, handleNewMessage);

    //načítání po přihlášení
    useEffect(() => {
        const fetchData = async () => {
            try {
                const chatData = await chatService.getConversations();
                setConversations(chatData || []);
                
                const initialRequests = await socialService.getPendingRequests();
                const receivedRequests = initialRequests?.recieved || [];

                setFriendRequests(receivedRequests);
                setNotifications({ friendRequests: receivedRequests.length });
            } catch (error) {
                console.error("Chyba při inicializaci Dashboardu:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
      if (!user?.id) return;

      const interval = setInterval(() => {
        const result = userService.pingStatus();
        if (result.success) {
          setUser(prev => ({
            ...prev,
            profile: {
              ...prev.profile,
              status: result.status,
            },
          }));
        }
      }, 120000);

      return () => clearInterval(interval);
    }, [user?.id]);

    //pro aut. scroll při přetýkání zpráv
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth'
      });
    }, [messages]);

  //Funkce, která se spustí při každém napsaném písmenku do vyhledávání
    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        const results = await userService.searchUsers(query);
        setSearchResults(results);

        const friends = await socialService.getFriends();
        const friendIds = new Set(friends.map(f => f.id));

        setSearchResults(
          results.map(u => ({
            ...u,
            isFriend: friendIds.has(u.id),
          }))
        );
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
      const newChat = await chatService.createConversation(foundUser.id);

      if (newChat) {
        const privateChat = normalizePrivateChat(newChat, foundUser);

        setConversations((prev) => [
          privateChat,
          ...prev,
        ]);

        setActiveChat(privateChat);
        setMessages([]);
        setSearchQuery("");
        setSearchResults([]);
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
            const result = await chatService.sendMessage(activeChat.id, currentMessage);

            if (result.success) {
              setMessages(prev => [
                ...prev,
                {
                  id: result.data?.message_id || Date.now(),
                  chat: activeChat.id,
                  sender_id: user.id,
                  sender: user,
                  content: currentMessage,
                  type: "text",
                  created_at: new Date().toISOString(),
                }
              ]);

              setCurrentMessage('');
              setSelectedImage(null);
              setShowEmojiPicker(false);
            } else {
              alert('Zprávu se nepodařilo odeslat.');
            }
        } catch (error) {
            console.error('Chyba při odesílání zprávy:', error);
            alert('Zprávu se nepodařilo odeslat.');
        }
    };

    if (showAdmin) {
        return <AdminDashboard onBack={() => setShowAdmin(false)} sendWebSocketMessage={sendMessage} />;
    }

    return (
    <div className="h-screen bg-gray-100 font-sans flex flex-col">
      {/* --- HORNÍ PANEL --- */}
      <AppHeader
        user={user}
        setUser={setUser}
        logout={logout}
        setShowAdmin={setShowAdmin}
        setIsFriendsOpen={setIsFriendsOpen}
        setIsProfileOpen={setIsProfileOpen}
        friendRequests={friendRequests}
      />
      <div className="flex flex-1 min-h-0 bg-gray-100 font-sans">
        {/* --- LEVÝ PANEL --- */}
        <div className="w-[400px] bg-violet-50 border-r border-violet-100 flex flex-col">
          {/* Vyhledávací políčko a nová skupina */}
          <div className="p-4 border-b border-violet-100 flex gap-2">
            <input
              type="text"
              placeholder="Hledat uživatele..."
              value={searchQuery}
              onChange={handleSearch}
              className="flex-1 rounded-2xl border border-violet-200 bg-white px-4 py-2 text-sm text-violet-700 placeholder-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
            <button
              onClick={() => setIsGroupOpen(true)}
              title="Vytvořit novou skupinu"
              className="h-10 w-10 rounded-2xl bg-violet-500 text-white hover:bg-violet-600 transition flex items-center justify-center"
            >
              <span className="text-xl font-bold leading-none">+</span>
            </button>
          </div>

          {/* Seznam chatů / Výsledky hledání */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {searchQuery.trim() !== "" ? (
              searchResults.length === 0 ? (
                <p className="text-center text-gray-400 text-sm mt-4">
                  Nenalezen žádný uživatel
                </p>
              ) : (
                searchResults.map((foundUser) => (
                  <SearchUserItem
                    key={`search-${foundUser.id}`}
                    foundUser={foundUser}
                    isSent={sentRequests.has(foundUser.id)}
                    onSendRequest={handleSendFriendRequest}
                    onStartChat={() => handleStartNewChat(foundUser)}
                  />
                ))
              )
            ) : conversations.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-4">
                Žádné konverzace
              </p>
            ) : (
              conversations.map((chat) => (
                <ConversationItem
                  key={chat.id}
                  chat={chat}
                  isActive={activeChat?.id === chat.id}
                  onClick={() => handleChatSelect(chat)}
                />
              ))
            )}
          </div>
        </div>

        {/* --- PRAVÝ PANEL --- */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {activeChat ? (
            <>
              {/* Hlavička chatu */}
              <ChatHeader
                chat={activeChat}
                onOpenGroupInfo={() => setIsGroupInfoOpen(true)}
              />

              {/* Výpis zpráv */}
              <div className="flex-1 overflow-y-auto px-10 py-6">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Zatím tu nejsou žádné zprávy. Napište jako první!
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isMine =
                        msg.isMine === true ||
                        msg.sender_id === user?.id ||
                        msg.sender?.id === user?.id;

                      return (
                        <MessageBubble
                          key={index}
                          msg={msg}
                          isMine={isMine}
                        />
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Panel pro psaní zpráv */}
              <MessageInput
                currentMessage={currentMessage}
                setCurrentMessage={setCurrentMessage}
                handleSendMessage={handleSendMessage}
                fileInputRef={fileInputRef}
                handleImageChange={handleImageChange}
                setShowEmojiPicker={setShowEmojiPicker}
                showEmojiPicker={showEmojiPicker}
                emojis={emojis}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
              />
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <svg
                className="w-16 h-16 mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                ></path>
              </svg>
              <p className="text-lg">Vyberte konverzaci z levého panelu</p>
            </div>
          )}
        </div>

        {isProfileOpen && <Profile onClose={() => setIsProfileOpen(false)} />}

        {isGroupOpen && (
          <CreateGroup
            onClose={() => setIsGroupOpen(false)}
            onCreate={(newGroup) => {
              setConversations((prev) => [newGroup, ...prev]);
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
              setConversations((prev) => prev.filter((c) => c.id !== chatId));
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
    </div>
  );
}

export default ChatDashboard;
