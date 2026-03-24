import axios from 'axios';
import { DEV_API_HOST, DEV_API_PORT } from 'react-native-dotenv';
import { LoginRequest, LoginResponse } from '../models/auth';

// For Android real devices, use adb reverse and keep localhost.
// If you run on Android emulator, switch host to 10.0.2.2.
const resolvedApiBaseUrl = __DEV__
  ? `http://${DEV_API_HOST}:${DEV_API_PORT}`
  : 'https://api.example.com';

const apiClient = axios.create({
  baseURL: resolvedApiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  fetchData: () => axios.get('https://jsonplaceholder.typicode.com/photos'),
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login', {
      username: payload.username,
      password: payload.password,
    });

    return response.data;
  },
};
