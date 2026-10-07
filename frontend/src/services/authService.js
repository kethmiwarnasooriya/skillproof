import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerUser = async (userData) => {
  // Matches backend RegisterRequest DTO: fullName, email, password
  const payload = {
    fullName: userData.fullName,
    email: userData.email,
    password: userData.password,
  };

  const response = await apiClient.post('/auth/register', payload);
  return response.data;
};

export default apiClient;