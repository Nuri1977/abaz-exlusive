import axios from "axios";
import type {
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { ApiError, NetworkError } from "./errors";

// Define response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

interface ErrorResponse {
  message?: string;
  [key: string]: any;
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
  withCredentials: true, // Enable cookies
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Cookies are automatically sent with requests when withCredentials is true
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(new NetworkError(error.message));
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const message = error.response.data?.message || "An error occurred";
      const data = error.response.data;

      // Handle specific status codes
      switch (status) {
        case 401:
          // Handle unauthorized
          // You might want to redirect to login or refresh token
          break;
        case 403:
          // Handle forbidden
          break;
        case 404:
          // Handle not found
          break;
        case 422:
          // Handle validation errors
          break;
      }

      return Promise.reject(new ApiError(status, message, data));
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new NetworkError("No response from server"));
    } else {
      // Something else happened
      return Promise.reject(new NetworkError(error.message));
    }
  }
);

// Type-safe request methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.put<T>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.patch<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T>(url, config).then((res) => res.data),
};

export default api;
