import axiosClient from './axiosClient';

export const adminService = {
    // Načtení systémových statistik
    getSystemStats: async () => {
        try {
            const response = await axiosClient.get('/api/users/admin/stats/');
            return response.data;
        } catch (error) { return null; }
    },

    // Načtení všech uživatelů do tabulky
    getAllUsers: async () => {
        try {
            const response = await axiosClient.get('/api/users/admin/management/');
            return response.data;
        } catch (error) { return []; }
    },

    updateUser: async (userId, data) => {
        try {
            const response = await axiosClient.patch(`/api/users/admin/management/${userId}`, data);
            return response.data;
        } catch (error) { throw error; }
    },

    bulkAction: async (actionType, userIds) => {
        try {
            const response = await axiosClient.post('/api/users/admin/bulk-action/', { action: actionType, users: userIds });
            return response.data;
        } catch (error) { throw error; }
    },

    // Načtení logů auditu

    getAuditLogs: async (searchQuery = '') => {
        try {
            const url = searchQuery ? `/api/users/admin/audit-logs/?search=${searchQuery}` : `/api/users/admin/audit-logs/`;
            const response = await axiosClient.get(url);
            return response.data;
        } catch (error) { return []; }
    },

    getAuditLogDetails: async (logId) => {
        try {
            const response = await axiosClient.get(`/api/users/admin/audit-logs/${logId}`);
            return response.data;
        } catch (error) { return null; }
    },



    // Zabanování uživatele 
    banUser: async (userId) => {
        try {
            const response = await axiosClient.patch(`/api/users/admin/management/${userId}`, { status: 'banned' });
            return response.data;
        } catch (error) { throw error; }
    },

    // Načtení všech skupin
    getAllGroups: async () => {
        try {
            const response = await axiosClient.get('/api/chat/admin/group-chats/');
            return response.data;
        } catch (error) { return []; }
    },

    // Smazání skupiny
    deleteGroup: async (chatId) => {
        try {
            const response = await axiosClient.delete(`/api/chat/admin/group-chats/${chatId}`);
            return response.data;
        } catch (error) { throw error; }
    },

    getAllMessages: async () => {
        try {
            const response = await axiosClient.get('/api/chat/admin/messages/');
            return response.data;
        } catch (error) { return []; }
    },

    deleteMessage: async (messageId) => {
        try {
            const response = await axiosClient.delete(`/api/chat/admin/messages/${messageId}`);
            return response.data;
        } catch (error) { throw error; }
    }

};

export default adminService;