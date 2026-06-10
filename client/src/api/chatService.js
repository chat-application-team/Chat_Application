import axiosClient from "./axiosClient";

export const chatService = {
    //funkce pro načítání konverzací
    createConversation: async (userId) => {
        try {
            const response = await axiosClient.post('/api/chat/chats/create/', {
                type: 'private',
                other_user_id: userId
            });
            return response.data;
        } catch (error) { return null; }
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

    getConversations: async () => {
        try {
            const response = await axiosClient.get('/api/chat/chats/');
            return response.data;
        } catch (error) { return []; }
    },

    //funkce vytváření skupiny
    createGroup: async (name, description = '') => {
        try {
            const response = await axiosClient.post('/api/chat/chats/create/', {
                type: 'group',
                name,
                description
            });
            return response.data;
        } catch (error) { return null; }
    },

    // Přidání člena do skupiny
    addMemberToGroup: async (chatId, userId) => {
        try {
            const response = await axiosClient.post(`/api/chat/chats/${chatId}/add-member/`, {
                user_id: userId
            });
            return { success: true, data: response.data };
        } catch (error) { return { success: false }; }
    },

    // Globální chat notifikace
    getNotifications: async () => {
        try {
            const response = await axiosClient.get('/api/chat/notifications/');
            return response.data;
        } catch (error) { return []; }
    },

    //
    reportUser: async (userId, reason = 'Porušení pravidel') => {
        try {
            await axiosClient.post('/api/chat/report/', {
                target: userId,
                reason
            });
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    removeMemberFromGroup: async (chatId, userId) => {
        try {
            const response = await axiosClient.post(`/api/chat/chats/${chatId}/remove-member/`, {
                user_id: userId
            });
            return { success: true, data: response.data };
        } catch (error) { return { success: false }; }
    },

    changeMemberRole: async (chatId, userId, role) => {
        try {
            const response = await axiosClient.post(`/api/chat/chats/${chatId}/change-role/`, {
                user_id: userId,
                role
            });
            return { success: true, data: response.data };
        } catch (error) { return { success: false }; }
    },

    leaveGroup: async (chatId) => {
        try {
            const response = await axiosClient.post(`/api/chat/chats/${chatId}/leave/`);
            return { success: true, data: response.data };
        } catch (error) { return { success: false }; }
    },

    deleteChat: async (chatId) => {
        try {
            const response = await axiosClient.delete(`/api/chat/chats/${chatId}/delete/`);
            return { success: true, data: response.data };
        } catch (error) { return { success: false }; }
    },

    markNotificationRead: async (notificationId) => {
        try {
            const response = await axiosClient.post(`/api/chat/notifications/${notificationId}/read/`);
            return { success: true, data: response.data };
        } catch (error) { return { success: false }; }
    },
};

export default chatService;