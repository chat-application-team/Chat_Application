//import axiosClient from "./axiosClient";

export const socialService = {
    //GET seznam aktual pritel
    getFriends: async() => {
        //temp
        return [
            { id: 101, username: 'Petr Novotný', status: 'online' },
            { id: 102, username: 'Pavel (Frontend)', status: 'offline' }
        ];

        /*s backendem
        const response = await axiosClient.get('/friends/');
        return response.data; */
    },

    //GET seznam nevyrizenich
    getPendingRequests: async () => {
        //temp
        return [
            { id: 201, fromUser: { id: 105, username: 'Tomáš Rychlý' } },
            { id: 202, fromUser: { id: 106, username: 'Lenka Nováková' } }
        ];

        /*s backendem
        const response = await axiosClient.get('/friends/requests/pending/');
        return response.data;*/
    },

    //POST posilani zadosti o frienda
    sendFriendRequest: async (userId) => {
        console.log(`Odesílám žádost uživateli ID: ${userId}`);
        return { success: true };
        //return await axiosClient.post('/friends/requests/', { target_user_id: userId });
    },

    //PATCH prijeti zadosti nebo ne
    respondToRequest: async (requestId, accept) => {
        console.log(`Žádost ${requestId} byla ${accept ? 'přijata' : 'odmítnuta'}`);
        return { success: true };
        //return await axiosClient.patch(`/friends/requests/${requestId}/`, { status: accept ? 'accepted' : 'rejected' });
    },

    //POST zablokovani
    blockUser: async (userId) => {
        console.log(`Blokuji uživatele ID: ${userId}`);
        return { success: true };
        //return await axiosClient.post(`/friends/block/`, { target_user_id: userId });
    },

    // POST odblokovani
    unblockUser: async (userId) => {
        console.log(`Odblokovávám uživatele ID: ${userId}`);
        return { success: true };
        //return await axiosClient.post('/friends/unblock/', { target_user_id: userId });
    }
}