import apiClient from "./index";

export const login = async (credentials) => {
  const response = await apiClient.post("/login/", credentials);
  if (response.data.access) {
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
  }
  return response.data;
};

export const register = (userData) => {
  return apiClient.post("/users/register", userData);
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return Promise.reject("No refresh token");

  const response = await apiClient.post("/token/refresh/", { refresh });
  if (response.data.access) {
    localStorage.setItem("access_token", response.data.access);
  }
  return response.data;
};

export const forgotPassword = (email) => {
  return apiClient.post("/users/forgot-password", { email });
};

export const resetPassword = (data) => {
  return apiClient.post("/users/rest-password", data);
};

export const verify = async (data) => {
  const response = await apiClient.post("/users/verify", data);
  if (response.data.tokens) {
    localStorage.setItem("access_token", response.data.tokens.access);
    localStorage.setItem("refresh_token", response.data.tokens.refresh);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.access}`;
  }
  if (response.data.user) {
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};

export const resendCode = (email) => {
  return apiClient.post("/users/resend-code", { email });
};
