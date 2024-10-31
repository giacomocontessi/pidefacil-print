import axios from 'axios';
import logoutUser from './logoutUser';
import updateTokens from './updateTokens';

const axiosInstance = axios.create({
    baseURL: 'https://api.pidefacil.app/api',
  });
  
  // Add a request interceptor to include the token in the request headers
  axiosInstance.interceptors.request.use(
    async (config) => {
      const token = window.electron.store.get('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Add a response interceptor to handle token refresh logic
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response ? error.response.status : null;
  
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = window.electron.store.get('refreshToken');
  
        try {
          const { data } = await axios.post('https://api.pidefacil.app/api/users/refresh-token', {
            refreshToken,
          });
  
          // Use the updateTokens function to update the tokens in electron-store
          updateTokens(data.accessToken, data.refreshToken);
  
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return axiosInstance(originalRequest);
        } catch (err) {
          // If refresh token fails, log the user out
          logoutUser();
        }
      }
      return Promise.reject(error);
    }
  );
  
  export default axiosInstance;
  