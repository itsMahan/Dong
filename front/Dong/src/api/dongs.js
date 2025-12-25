import apiClient from "./index";

export const listDongs = () => {
    return apiClient.get("/dongs/list/");
};

export const createDong = (title) => {
    return apiClient.post("/dongs/create/", { title });
};

export const updateDong = (id, title) => {
    return apiClient.patch(`/dongs/update/${id}/`, { title });
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
