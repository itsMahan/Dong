import apiClient from "./index";

export const listExpenses = (dongId) => {
    return apiClient.get(`/dongs/expenses/list/${dongId}/`);
};

export const addExpense = (dongId, expenseData) => {
    return apiClient.post(`/dongs/expense/add/${dongId}/`, expenseData);
};

export const updateExpense = (id, expenseData) => {
    return apiClient.patch(`/dongs/expense/update/${id}/`, expenseData);
};

export const deleteExpense = (id) => {
    return apiClient.delete(`/dongs/expense/delete/${id}/`);
};

export const addExpenseParticipant = (participantData) => {
    return apiClient.post("/dongs/expense_participant/add/", participantData);
};
