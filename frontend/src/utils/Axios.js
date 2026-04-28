import axios from "axios";
import { store } from "../store/store";

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/`;
const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

//sending access token in the header
Axios.interceptors.request.use(
  async (config) => {
    const token = store.getState().user.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default Axios;
