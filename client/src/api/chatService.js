import axiosClient from "./axiosClient";

export const chatService = {
    //funkce pro načítání konverzací
    getConversations: async () => {
        try {
            const response = await axiosClient.get('/api/chat/chats/');
            return response.data;
        } catch (error) { return []; }
    },

    //funkce pro načítání zpráv v konverzaci
    getMessages: async (chatId) => {
        try{
            const response = await axiosClient.get(`/api/chat/chats/${chatId}/messages/`);
            return response.data;
        } catch (error) { return []; }
    },

    // Odeslání zprávy
    sendMessage: async (chatId, content) => {
        try {
            const response = await axiosClient.post(`/api/chat/chats/${chatId}/send/`, { content });
            return { success: true, data: response.data };
        } catch (error) { return { success: false }; }
    },

    createConversation: async (userId) => {
        try {
            const response = await axiosClient.post('/api/chat/chats/create/', { 
                target_user_id: userId, is_group: false 
            });
            return response.data;
        } catch (error) { return null; }
    },

    //funkce vytváření skupiny
    createGroup: async (name, memberIds) => {
        try {
            const response = await axiosClient.post('/api/chat/chats/create/', {
                name: name, members: memberIds, is_group: true
            });
            return response.data;
        } catch (error) { return null; }
    },

    // Přidání člena do skupiny
    addMemberToGroup: async (chatId, userId) => {
        try {
            const response = await axiosClient.post(`/api/chat/chats/${chatId}/add-member/`, { target_user_id: userId });
            return { success: true, data: response.data };
        } catch (error) { return { success: false }; }
    },

    // Globální chat notifikace
    getNotifications: async () => {
        try {
            const response = await axiosClient.get('/api/chat/notifications/');
            return response.data;
        } catch (error) { return []; }
    }
};

export default chatService;