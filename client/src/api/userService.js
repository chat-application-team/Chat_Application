//import axiosClient from "./axiosClient";

export const userService = {
  searchUsers: async (query) => {
    if (!query.trim()) return [];

    // Falešná data pro testování
    const mockUsers = [
        { id: 101, username: 'Petr Novotný' },
        { id: 102, username: 'Pavel (Frontend)' },
        { id: 103, username: 'Školní Admin' },
        { id: 104, username: 'Jana Dvořáková' }
    ];
    
    return mockUsers.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase())
    );

        /*
        try {
            const response = await axiosClient.get(`/users/search/?q=${query}`);
            return response.data;
        } catch (error) {
            console.error('Chyba při vyhledávání uživatelů:', error);
            return [];
        }*/
    }
};