import axios from "axios";

// ✅ Your backend URL on Render
export const BASE_URL = "https://medimart-backend-bv5k.onrender.com";

// ✅ Set default backend URL for ALL axios requests
axios.defaults.baseURL = BASE_URL;

export const getError = (error) => {
  return error.response && error.response.data
    ? error.response.data.message
    : error.message || "Something went wrong";
};
