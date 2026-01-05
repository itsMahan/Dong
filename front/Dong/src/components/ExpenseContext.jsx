import React, { createContext, useState, useEffect, useCallback } from "react";
import * as dongsApi from "../api/dongs";
import * as expensesApi from "../api/expenses";
import * as membersApi from "../api/members";

const ExpenseContext = createContext({
  groups: [],
  loading: false,
  error: null,
  getGroup: (id) => {},
  addGroup: (group) => {},
  updateGroup: (group) => {},
  removeGroup: (id) => {},
  addTransaction: (groupId, tx) => {},
  updateTransaction: (groupId, txId, tx) => {},
  removeTransaction: (groupId, txId) => {},
  addMember: (groupId, member) => {},
  removeMember: (groupId, memberName) => {},
  fetchGroups: () => {},
  addExpenseWithParticipants: (groupId, expense) => {},
});

export function ExpenseProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dongsApi.listDongs();
      const groupsWithExpenses = await Promise.all(
        response.data.map(async (group) => {
          try {
            const expensesResponse = await expensesApi.listExpenses(group.id);
            const processedTransactions = expensesResponse.data.map((tx) => {
              let payerId = null;
              if (typeof tx.paid_by === 'string') {
                const payerNameMatch = tx.paid_by.match(/(.*) member of: (.*)/);
                if (payerNameMatch && group.members) {
                  const payerName = payerNameMatch[1];
                  const payerMember = group.members.find(
                    (m) => m.name === payerName
                  );
                  payerId = payerMember ? payerMember.id : null;
                }
              } else if (tx.paid_by && typeof tx.paid_by === 'object') {
                // If paid_by is already an object with an id, use it
                payerId = tx.paid_by.id;
              }

              return {
                ...tx,
                date: tx.created_at, // Map created_at to date
                paid_by: payerId || tx.paid_by, 
              };
            });

            return {
              ...group,
              members: group.members || [],
              transactions: processedTransactions || [],
            };
          } catch (err) {
            console.error(`Failed to fetch expenses for group ${group.id}:`, err);
            return {
              ...group,
              members: group.members || [],
              transactions: [],
              error: "Failed to load expenses",
            };
          }
        })
      );
      setGroups(groupsWithExpenses);
    } catch (err)
 {
      console.error("fetchGroups error:", err);
      setError(err);
    }
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const getGroup = (id) => groups.find((g) => String(g.id) === String(id));

  const addGroup = async (group) => {
    setLoading(true);
    try {
      const newDongResponse = await dongsApi.createDong(group.title);
      const newDong = newDongResponse.data;

      const memberPromises = group.members.map((member) =>
        membersApi.addMember({ dong: newDong.id, name: member.name })
      );

      await Promise.all(memberPromises);
      await fetchGroups(); // Re-fetch all groups to get the new one with its members
      return newDong;
    } catch (err) {
      console.error("addGroup error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (group) => {
    setLoading(true);
    try {
      await dongsApi.updateDong(group.id, group.title);
      setGroups(groups.map((g) => (g.id === group.id ? group : g)));
    } catch (err) {
      console.error("updateGroup error:", err);
      setError(err);
    }
    finally {
      setLoading(false);
    }
  };

  const removeGroup = async (id) => {
    setLoading(true);
    try {
      await dongsApi.deleteDong(id);
      setGroups(groups.filter((g) => g.id !== id));
    } catch (err) {
      console.error("removeGroup error:", err);
      setError(err);
    }
    finally {
      setLoading(false);
    }
  };

  const addTransaction = async (groupId, tx) => {
    setLoading(true);
    try {
      await expensesApi.addExpense(groupId, tx);
      await fetchGroups();
    } catch (err) {
      console.error("addTransaction error:", err.response ? err.response.data : err);
      setError(err);
    }
    finally {
      setLoading(false);
    }
  };

  const addExpenseWithParticipants = async (groupId, expense) => {
    setLoading(true);
    try {
      await expensesApi.addExpense(groupId, expense);
      await fetchGroups();
    } catch (err) {
      console.error("addExpenseWithParticipants error:", err);
      setError(err);
    }
    finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (groupId, txId, tx) => {
    setLoading(true);
    try {
      await expensesApi.updateExpense(txId, tx);
      await fetchGroups();
    } catch (err) {
      console.error("updateTransaction error:", err);
      setError(err);
    }
    finally {
      setLoading(false);
    }
  };
  const removeTransaction = async (groupId, txId) => {
    setLoading(true);
    try {
      await expensesApi.deleteExpense(txId);
      await fetchGroups();
    } catch (err) {
      console.error("removeTransaction error:", err);
      setError(err);
    }
    finally {
      setLoading(false);
    }
  };

  const addMember = async (groupId, member) => {
    setLoading(true);
    try {
      await membersApi.addMember({ dong: groupId, name: member.name });
      await fetchGroups();
    } catch (err) {
      console.error("addMember error:", err);
      setError(err);
    }
    finally {
      setLoading(false);
    }
  };

  const removeMember = async (groupId, memberName) => {
    setLoading(true);
    try {
      await membersApi.deleteMember(groupId, memberName);
      await fetchGroups();
    } catch (err) {
      console.error("removeMember error:", err);
      setError(err);
    }
    finally {
      setLoading(false);
    }
  };

  const value = {
    groups,
    loading,
    error,
    getGroup,
    addGroup,
    updateGroup,
    removeGroup,
    addTransaction,
    addExpenseWithParticipants,
    updateTransaction,
    removeTransaction,
    addMember,
    removeMember,
    fetchGroups,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
}

export default ExpenseContext;

