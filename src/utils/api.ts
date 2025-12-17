// API Base URL - configured via environment variable
// Copy .env.example to .env and set VITE_API_BASE_URL for your local setup
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/MiniProjectyeow/MiniProject/public/api';

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
                const text = await response.text();
                try {
                    const errData = JSON.parse(text);
                    if (errData && errData.message) {
                        errMessage = errData.message;
                    }
                } catch {
                    if (text) errMessage = text;
                }
            } catch (e) {
                // Ignore text read error
            }
            throw new Error(errMessage);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch API error:", error);
        throw error;
    }
};
