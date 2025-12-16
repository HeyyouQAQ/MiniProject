// API Base URL - configured via environment variable
// Copy .env.example to .env and set VITE_API_BASE_URL for your local setup
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/MiniProject/public/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        if (!response.ok) {
            let errMessage = response.statusText;
            try {
                const errData = await response.json();
                if (errData && errData.message) {
                    errMessage = errData.message;
                }
            } catch (e) {
                // If JSON parse fails, use text
                const text = await response.text();
                if (text) errMessage = text;
            }
            throw new Error(errMessage);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch API error:", error);
        throw error;
    }
};
