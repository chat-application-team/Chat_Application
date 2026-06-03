import axiosClient from "./axiosClient";

export const socialService = {
    //GET seznam aktual pritel
    getFriends: async () => {
        try {
            const response = await axiosClient.get('/api/users/relations/');
            return response.data;
        } catch (error) { return []; }
    },

    //GET seznam nevyrizenich
    getPendingRequests: async () => {
        try {
            const response = await axiosClient.get('/api/users/relations/requests/');
            return response.data;
        } catch (error) { return []; }
    },

    //POST posilani zadosti o frienda
    sendFriendRequest: async (userId) => {
        try {
            await axiosClient.post('/api/users/relations/requests/', { target_user_id: userId });
            return { success: true };
        } catch (error) { return { success: false }; }
    },

    //PATCH prijeti zadosti nebo ne
    respondToRequest: async (requestId, accept) => {
        try {
            await axiosClient.patch(`/api/users/relations/requests/${requestId}/`, { status: accept ? 'accepted' : 'rejected' });
            return { success: true };
        } catch (error) { return { success: false }; }
    },

    //POST zablokovani
    blockUser: async (userId) => {
        try {
            await axiosClient.post(`/api/users/relation/block/`, { target_user_id: userId });
            return { success: true };
        } catch (error) { return { success: false }; }
    },

    reportUser: async (userId, reason = 'Porušení pravidel') => {
        try {
            await axiosClient.post(`/api/users/relation/report/`, { target_user_id: userId, reason });
            return { success: true };
        } catch (error) { return { success: false }; }
    },

    //GET seznam zablokovanych  
    getBlockedUsers: async () => {
        try {
            const response = await axiosClient.get('/api/users/me/blocked/');
            return response.data;
        } catch (error) { return []; }
    },

    // POST odblokovani
    unblockUser: async (userId) => {
        try {
            await axiosClient.delete(`/api/users/relations/delete/${userId}`);
            return { success: true };
        } catch (error) { return { success: false }; }
    }
};

export default socialService;