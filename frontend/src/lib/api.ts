import axios from "axios";
import { getAccessToken } from "./auth";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// ============================================================================
// Authentication Endpoints
// ============================================================================

export async function registerUser(payload: {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}) {
  try {
    const response = await api.post("/api/register/", payload);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    const message = error.response?.data?.message || "Registration failed";
    const errors = error.response?.data?.errors || {};
    return {
      success: false,
      message,
      errors,
    };
  }
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  data?: {
    access: string;
    refresh: string;
    role: string;
    email: string;
    username: string;
    message: string;
  };
  message?: string;
  errors?: Record<string, string>;
}> {
  try {
    console.log("[DEBUG] loginUser - sending payload:", payload);
    const response = await api.post("/api/login/", payload);
    console.log("[DEBUG] loginUser - response:", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.log("[DEBUG] loginUser - error response:", error.response?.data);
    const message = error.response?.data?.message || "Login failed";
    const errors = error.response?.data?.errors || {};
    return {
      success: false,
      message,
      errors,
    };
  }
}
