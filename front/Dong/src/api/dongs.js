import apiClient from "./index";

export const listDongs = () => {
    return apiClient.get("/dongs/list/");
};

export const createDong = (title, total_budget) => {
    return apiClient.post("/dongs/create/", { title, total_budget });
};

export const updateDong = (id, title, total_budget) => {
    return apiClient.patch(`/dongs/update/${id}/`, { title, total_budget });
};

export const deleteDong = (id) => {
    return apiClient.delete(`/dongs/delete/${id}/`);
};

export const getDongBalance = (dongId) => {
    return apiClient.get(`/dongs/balance/${dongId}/`);
};

export const getDongSettlement = (dongId) => {
    return apiClient.get(`/dongs/settlement/${dongId}/`);
};
