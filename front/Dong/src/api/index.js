import axios from "axios";

const apiClient = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let logoutCallback = null;

export const setupInterceptors = (logout) => {
    logoutCallback = logout;
};

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (logoutCallback) {
                logoutCallback();
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
