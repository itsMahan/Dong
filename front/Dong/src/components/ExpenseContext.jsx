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
  updateTransaction: (groupId, tx) => {},
  removeTransaction: (groupId, txId) => {},
  addMember: (groupId, member) => {},
  removeMember: (groupId, memberName) => {},
  fetchGroups: () => {},
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
      console.log("fetchGroups response:", response);
      setGroups(response.data);
    } catch (err) {
      console.error("fetchGroups error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const getGroup = (id) => groups.find((g) => g.id === id);

  const addGroup = async (group) => {
    setLoading(true);
    try {
      console.log("addGroup request:", group);
      const newGroup = await dongsApi.createDong(group.title);
      console.log("addGroup response:", newGroup);
      await fetchGroups();
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
    } finally {
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
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (groupId, tx) => {
    setLoading(true);
    try {
      const newTx = await expensesApi.addExpense(groupId, tx);
      setGroups(
        groups.map((g) =>
          g.id === groupId
            ? { ...g, transactions: [...g.transactions, newTx.data] }
            : g
        )
      );
    } catch (err) {
      console.error("addTransaction error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (groupId, tx) => {
    setLoading(true);
    try {
      await expensesApi.updateExpense(tx.id, tx);
      setGroups(
        groups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                transactions: g.transactions.map((t) =>
                  t.id === tx.id ? tx : t
                ),
              }
            : g
        )
      );
    } catch (err) {
      console.error("updateTransaction error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const removeTransaction = async (groupId, txId) => {
    setLoading(true);
    try {
      await expensesApi.deleteExpense(txId);
      setGroups(
        groups.map((g) =>
          g.id === groupId
            ? { ...g, transactions: g.transactions.filter((t) => t.id !== txId) }
            : g
        )
      );
    } catch (err) {
      console.error("removeTransaction error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (groupId, member) => {
    setLoading(true);
    try {
      const newMember = await membersApi.addMember({ dong: groupId, name: member.name });
      setGroups(
        groups.map((g) =>
          g.id === groupId
            ? { ...g, members: [...g.members, newMember.data] }
            : g
        )
      );
    } catch (err) {
      console.error("addMember error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (groupId, memberName) => {
    setLoading(true);
    try {
      await membersApi.deleteMember(groupId, memberName);
      setGroups(
        groups.map((g) =>
          g.id === groupId
            ? { ...g, members: g.members.filter((m) => m.name !== memberName) }
            : g
        )
      );
    } catch (err) {
      console.error("removeMember error:", err);
      setError(err);
    } finally {
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
