import { createContext, useState, useEffect } from 'react';
import API from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            console.log('Attempting login for:', email);
            const res = await API.post('/auth/login', { email, password });
            console.log('Login response:', res.data);
            
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setUser(res.data.user);
                return { success: true };
            } else {
                return { success: false, message: res.data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed. Please check your credentials.'
            };
        }
    };

    const signup = async (name, email, password) => {
        try {
            console.log('Attempting signup for:', email);
            const res = await API.post('/auth/signup', { name, email, password });
            console.log('Signup response:', res.data);
            
            if (res.data.success) {
                return { success: true, message: 'Account created! Please login.' };
            } else {
                return { success: false, message: res.data.message || 'Signup failed' };
            }
        } catch (error) {
            console.error('Signup error:', error.response?.data || error.message);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Signup failed. Please try again.'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};