import { BASE_URL } from "@/constants/base-url";
import axios from "axios";

// Create a basic axios instance
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;
