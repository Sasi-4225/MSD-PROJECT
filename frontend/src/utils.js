// utils.js
import axios from "axios";

// ✅ Your backend URL on Render
export const BASE_URL = "https://backend-3s5c.onrender.com";

// ✅ Automatically use backend URL for all requests
axios.defaults.baseURL = BASE_URL;

export const getError = (error) => {
  return error.response && error.response.data
    ? error.response.data.message
    : error.message || "Something went wrong";
};
