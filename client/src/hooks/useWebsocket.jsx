import { useEffect, useRef } from 'react';

export const useWebSocket = (user, onMessageReceived, onFriendRequest, onSystemAction) => {
  const ws = useRef(null);

  useEffect(() => {
    if (!user) return; // Nepřipojujeme se, pokud není uživatel přihlášen

    /* --- PŘÍPRAVA NA BACKEND: Skutečná WS adresa ---
    // Adresa bude pravděpodobně obsahovat token nebo ID uživatele pro ověření
    // const WS_URL = `ws://localhost:3000?token=${user.token}`; 
    ------------------------------------------------ */
    const WS_URL = 'ws://localhost:8080'; // Dočasná lokální adresa pro testování
    
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => console.log('WebSocket připojen!');
    ws.current.onclose = () => console.log('WebSocket odpojen!');
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WS přijato:', data);

      switch (data.type) {
        case 'CHAT_MESSAGE':
          if (onMessageReceived) onMessageReceived(data);
          break;
        case 'FRIEND_REQUEST':
          if (onFriendRequest) onFriendRequest(data);
          break;
        case 'SYSTEM_ACTION':
          if (onSystemAction) onSystemAction(data);
          break;
        default:
          console.warn('Neznámý typ WS zprávy:', data);
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [user]);

  const sendMessage = (msgObj) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msgObj));
    } else {
      console.error('WebSocket není připojen!');
    }
  };

  return { sendMessage };
};