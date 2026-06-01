//import axiosClient from "./axiosClient";

export const chatService = {
    //funkce pro načítání konverzací
    getConversations: async () => {

        return [
            { id: 1, name: 'Obecný chat', isGroup: true, unread: 2 },
            { id: 2, name: 'Petr Novák', isGroup: false, unread: 0 },
            { id: 3, name: 'Skupina A', isGroup: true, unread: 5 }
        ]

        /*
        try {
            const response = await axiosClient.get('/chats/');
            return response.data;
        } catch (error) {
            console.error('Chyba při načítání konverzací:', error);
            return [];
        }*/
    },

    //funkce pro načítání zpráv v konverzaci
    getMessages: async (chatId) => {

        return [
            { text: 'Ahoj, jak se máš?', isMine: false },
            { text: 'Mám se dobře, díky! A ty?', isMine: true },
            { text: `Taky fajn, co je nového? Id:${chatId}`, isMine: false },
        ]

        /*
        try{
            const response = await axiosClient.get(`/chats/${chatId}/messages/`);
            return response.data;
        } catch (error) {
            console.error('Chyba při načítání zpráv:', error);
            return [];
        }*/
    },

    createConversation: async (userId, username) => {
        return { 
        id: Date.now(), // Vygeneruje unikátní číslo
        name: username, 
        unread_count: 0 
        };

        /*
        try {
            const response = await axiosClient.post('/chats/', { target_user_id: userId });
            return response.data;
        } catch (error) {
            console.error('Nelze vytvořit chat:', error);
            return null;
        }*/
    },
};