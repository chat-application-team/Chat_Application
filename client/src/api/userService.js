import axiosClient from "./axiosClient";

export const userService = {
    searchUsers: async (query) => {
        if (!query.trim()) return [];
        try {
            // Endpoint podporuje vyhledávání přes ?search= 
            const response = await axiosClient.get(`/api/users/search?search=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error('Chyba při vyhledávání uživatelů:', error);
            return [];
        }
    },

    // Získání detailu konkrétního uživatele
    getUserProfile: async (userId) => {
        try {
            const response = await axiosClient.get(`/api/users/${userId}/`);
            return response.data;
        } catch (error) {
            return null;
        }
    },

    updateProfile: async (data) => {
    try {
        const response = await axiosClient.patch(
        "/api/users/me/update/",
        data
        );

        return { success: true, data: response.data };
    } catch (error) {
        return {
        success: false,
        message: error.response?.data?.detail || "Chyba při ukládání",
        };
    }
    },

    //Změna hesla
    changePassword: async (oldPassword, newPassword) => {
        try {
            await axiosClient.post('/api/users/me/change-password/', {
                old_password: oldPassword,
                new_password: newPassword
            });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.detail || 'Nelze změnit heslo' };
        }
    },

    // Nenávratné smazání vlastního účtu
    deleteAccount: async () => {
        try {
            await axiosClient.delete('/api/users/me/delete/');
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    // Udržovací ping (např. pro zjištění, že je server online)
    pingStatus: async () => {
        try {
            const response = await axiosClient.post('/api/users/me/ping/');
            return response.data;
        } catch (error) {
            return null;
        }
    },

    updateStatus: async (status) => {
        try {
            const response = await axiosClient.patch('/api/users/me/update/', {
            profile: {
                status
            }
            });

            return { success: true, data: response.data };
        } catch (error) {
            return {
            success: false,
            message: error.response?.data?.detail || 'Nelze změnit status'
            };
        }
    },
};

export default userService;