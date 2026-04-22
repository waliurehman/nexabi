import axios from 'axios';
import API_URL from './config';

export const askQuery = async (question, api_key, dataset_id, token, model = 'groq', conversation_history = []) => {
  const response = await axios.post(`${API_URL}/queries/ask`, 
    { question, api_key, dataset_id, model, conversation_history },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getHistory = async (token) => {
  const response = await axios.get(`${API_URL}/queries/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
