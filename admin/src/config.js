// Centralized API & Backend URL Configuration
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'https://reetsutra.onrender.com').replace(/\/$/, '');
export const API_BASE_URL = `${BACKEND_URL}/api`;
