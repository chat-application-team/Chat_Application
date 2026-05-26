import { useState } from 'react';
import { useAuth } from '../store/AuthContext';

function ChatDashboard() {
    const { user, logout } = useAuth();

    const [currentMessage, setCurrentMessage] = useState('');

    //test data
    const [contacts] = useState([
        { id: 1, name: 'idk', isGroup: true, unread: 3 },
        { id: 2, name: 'idk2', isGroup: false, unread: 0 },
    ]);

    const [messages, setMessages] = useState([
        { id: 1, text: 'sup dude', sender: 'filip', isMine: false, time: '66:66' },
        { id: 2, text: 'sup dude', sender: 'filip', isMine: true, time: '68:69' },
    ]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!currentMessage.trim()) return;

        //temp pro check
        const newMessage = {
            id: Date.now(),
            text: currentMessage,
            sender: user?.name || 'Ty',
            isMine: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMessage]);
        setCurrentMessage('');
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* --- LEVÝ PANEL (Seznam konverzací a profil) --- */}
      <div className="w-1/4 bg-white border-r border-gray-300 flex flex-col">
        {/* Hlavička s profilem přihlášeného uživatele */}
        <div className="p-4 border-b border-gray-300 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="font-bold">ChatApp</h2>
            {/* Zde vypisujeme reálné jméno z našeho AuthContextu! */}
            <p className="text-xs text-gray-600">Přihlášen jako: {user?.username || 'Uživatel'}</p>
          </div>
          <button 
            onClick={logout} // Logika pro odhlášení
            className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Odhlásit
          </button>
        </div>

        {/* Seznam kontaktů - designér si tu může hrát s mapováním */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {contacts.map(contact => (
            <div key={contact.id} className="p-3 bg-gray-50 hover:bg-gray-100 rounded cursor-pointer flex justify-between">
              <span className="font-semibold">{contact.name}</span>
              {contact.unread > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {contact.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>


      {/* --- PRAVÝ PANEL (Samotný chat) --- */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Hlavička aktivního chatu */}
        <div className="p-4 border-b border-gray-300 bg-white shadow-sm">
          <h2 className="font-bold text-lg">Školní Projekt - Tým</h2>
        </div>

        {/* Historie zpráv */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-gray-500 mb-1">{msg.sender}</span>
              <div className={`p-3 rounded-lg max-w-md ${msg.isMine ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-400 mt-1">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Políčko pro odeslání zprávy */}
        <div className="p-4 bg-white border-t border-gray-300">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input 
              type="text" 
              value={currentMessage} // Propojeno se stavem
              onChange={(e) => setCurrentMessage(e.target.value)} // Propojeno se stavem
              placeholder="Napiš zprávu..." 
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Odeslat
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default ChatDashboard;