export const API_BASE_URL = 'http://localhost/MiniProject/public/api';

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
            const errText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch API error:", error);
        throw error;
    }
};
