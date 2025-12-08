import axios from 'axios';
import { API_BASE_URL } from '../lib/constants';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const submitContent = async (content: string) => {
    const response = await api.post('/submissions', {
        userId: crypto.randomUUID(),
        content,
    });
    return response.data;
};

export default api;
