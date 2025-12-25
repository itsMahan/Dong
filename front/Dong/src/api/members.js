import apiClient from "./index";

export const addMember = (memberData) => {
    return apiClient.post("/dongs/member/add/", memberData);
};

export const deleteMember = (dongId, memberName) => {
    return apiClient.delete(`/dongs/member/delete/${dongId}/${memberName}/`);
};

export const getMemberDetail = (dongId, memberName) => {
    return apiClient.get(`/dongs/member-detail/${dongId}/${memberName}/`);
};
