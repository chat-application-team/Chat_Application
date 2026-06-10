import { useEffect, useRef } from 'react';

const useWebSocket = (user, chatId, onMessageReceived) => {
  const ws = useRef(null);

    useEffect(() => {
        if (!user?.id || !chatId) return;

        const token = localStorage.getItem('accessToken');
        
        const WS_URL = `ws://127.0.0.1:8000/ws/chat/${chatId}/?token=${token}`;
        
        ws.current = new WebSocket(WS_URL);

        ws.current.onopen = () => console.log('WebSocket úspěšně připojen!');
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
            console.error('WebSocket není připojen, zprávu nelze odeslat!');
        }
    };
    
    return { sendMessage };
};

export default useWebSocket;