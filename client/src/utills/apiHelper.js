import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const adminLogin = async (data) => {
  const response = await api.post("/admin/login", data);
  return response.data;
};

export const getCurrentAdmin = async () => {
  const response = await api.get("/admin/me");
  return response.data;
};

export const getAllChats = async (params = {}) => {
  const response = await api.get("/chats", { params });
  return response.data;
};

export const getChatById = async (id) => {
  const response = await api.get(`/chats/${id}`);
  return response.data;
};

export const closeChat = async (id) => {
  const response = await api.put(`/chats/${id}/close`);
  return response.data;
};

export const getAllMessages = async (params = {}) => {
  const response = await api.get("/chats/messages/all", { params });
  return response.data;
};

export const toggleAI = async (id, aiEnabled) => {
  const response = await api.put(`/chats/${id}/toggle-ai`, { aiEnabled });
  return response.data;
};

