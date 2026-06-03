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
                    const response = await axiosClient.get('/api/users/me/'); 
                    setUser(response.data);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error("Token vypršel.");
                    logout();
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    //funkce pro přihlášení
    const login = async (login, password) => {
        try {
            const response = await axiosClient.post('/api/users/login/', { login, password });
            const token = response.data.token;

            localStorage.setItem('accessToken', token);
            
            const userResponse = await axiosClient.get('/api/users/me/', {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            setUser(userResponse.data);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.detail || 'Špatné jméno nebo heslo'
            };
        }
    };

    const register = async (username, email, password) => {
        try{
            const response = await axiosClient.post('/api/users/register/', { username, email, password });

            const loginResponse = await axiosClient.post('/api/users/login/', {
                login: username,
                password: password
            });

            const token = loginResponse.data.token
            localStorage.setItem('accessToken', token);
            
            const userResponse = await axiosClient.get('/api/users/me/', {
                headers: {
                    Authorization: `Token ${token}`
                }
            });
            
            setUser(userResponse.data);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            console.error('Chyba při registraci: ', error);
            return {
                success: false,
                message: error.response?.data?.detail || 'Registrace se nezdařila.'
            };
        }
    }

    //funkce pro odhlášení
    const logout = async () => {
        try {
            await axiosClient.post('/api/users/logout/');
        } catch (e) {
            console.error("Chyba logoutu", e);
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, isAuthenticated, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);