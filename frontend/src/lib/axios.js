// src/lib/axios.js

import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "/api",
});

// Add interceptor to attach Clerk auth token
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const token = await window.Clerk?.session?.getToken(); // Clerk must be loaded
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("Failed to get Clerk token", err);
  }

  return config;
});
