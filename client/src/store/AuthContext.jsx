import { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    //kontrola přihlášení
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const response = await axiosClient.get('/profile/');
                    setUser(response.data);
                    setIsAuthenticated(true);
                } catch (error) {
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    //funkce pro přihlášení
    const login = async (username, password) => {
        try {
            const response = await axiosClient.post('/login/', { username, password });

            //Uložení tokenu
            localStorage.setItem('accessToken', response.data.access);
            setUser(response.data.user);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.detail || 'Špatný jmeno nebo heslo'
            };
        }
    };

    //funkce pro odhlášení
    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);