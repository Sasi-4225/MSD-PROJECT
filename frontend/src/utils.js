// utils.js
import axios from "axios";

// ✅ Your backend URL on Render
export const BASE_URL = "https://medimart-backend-bv5k.onrender.com";

// ✅ Set this as the default base URL for all axios requests
axios.defaults.baseURL = BASE_URL;

export const getError = (error) => {
  return error.response && error.response.data
    ? error.response.data.message
    : error.message || "Something went wrong";
};
