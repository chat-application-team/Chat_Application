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
            const response = await axiosClient.patch(`/api/users/admin/management/${userId}/`, data);
            return response.data;
        } catch (error) { throw error; }
    },

    bulkAction: async (actionType, userIds, role = null) => {
        try {
            const response = await axiosClient.post('/api/users/admin/bulk-action/', {
                action: actionType,
                user_ids: userIds,
                ...(role ? { role } : {})
            });
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
            const response = await axiosClient.get(`/api/users/admin/audit-logs/${logId}/`);
            return response.data;
        } catch (error) { return null; }
    },



    // Zabanování uživatele 
    banUser: async (userId) => {
        try {
            const response = await axiosClient.patch(`/api/users/admin/management/${userId}/`, {
                is_active: false
            });
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
            const response = await axiosClient.delete(`/api/chat/admin/group-chats/${chatId}/`);
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
            const response = await axiosClient.delete(`/api/chat/admin/messages/${messageId}/`);
            return response.data;
        } catch (error) { throw error; }
    },

    activateUser: async (userId) => {
        try {
            const response = await axiosClient.patch(`/api/users/admin/management/${userId}/`, {
                is_active: true
            });
            return response.data;
        } catch (error) { throw error; }
    },

    resolveReport: async (reportId) => {
        try {
            const response = await axiosClient.post(`/api/chat/report/${reportId}/resolve/`);
            return response.data;
        } catch (error) { throw error; }
    },

    getReports: async () => {
        try {
            const response = await axiosClient.get('/api/chat/report/');
            return response.data;
        } catch (error) { return []; }
    },

    getReportDetails: async (reportId) => {
        try {
            const response = await axiosClient.get(`/api/chat/report/${reportId}/`);
            return response.data;
        } catch (error) { return null; }
    },

};

export default adminService;