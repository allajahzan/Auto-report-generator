import { BASE_URL } from "@/constants/baseUrl";
import axios from "axios";

// Create a basic axios instance
export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});