import axios from "axios";
import { logout } from "./auth";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL + "/api",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("jwtToken");

    // Don't add token for login
    if (token && !config.url.includes("/auth/login")) {
        config.headers.Authorization = `Bearer ${token}`;
    }


    return config;
});


API.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        logout("Your session has expired. Please log in again."); 
      }
      return Promise.reject(error);
    }
  );

export default API;

//automatically redirect to login if we get 401