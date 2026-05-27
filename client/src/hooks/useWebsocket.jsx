import { useState, useEffect, useRef } from 'react';

const useWebsocket = (roomName) => {
    //se co prijde ze serveru
    const [messages, setMessages] = useState([]);

    const ws = useRef(null);

    useEffect(() => {
        if (!roomName) return;

        const token = localStorage.getItem('accessToken');

        const wsUrl = `ws://127.0.0.1:8000/ws/chat/${roomName}/?token=${token}`;

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket připojen');
        };

        ws.current.onmessage = (event) => {
            const incomingData = JSON.parse(event.data);
            console.log('Přijatá zpráva:', incomingData);
            setMessages((prevMessages) => [...prevMessages, incomingData]);
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket chyba:', error);
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [roomName]);

    const sendMessage = (message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                text: message,
            }));
        } else {
            console.warn('Socket není připojen');
        }
    };

    return { messages, setMessages };
};

export default useWebsocket;