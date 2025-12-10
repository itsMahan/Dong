import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";

const STORAGE_KEY = "dong_expenses_v1";
const BACKUP_KEY = STORAGE_KEY + "_backup";

const ExpenseContext = createContext(null);

const initialState = {
  members: [],
  transactions: [],
};

function genId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return String(Date.now()) + Math.random().toString(36).slice(2, 9);
}

function reducer(state, action) {
  console.log("[ExpenseContext] reducer action", action.type, action.payload);
  switch (action.type) {
    case "INIT":
      console.log("[ExpenseContext] reducer INIT payload", action.payload);
      return { ...state, ...action.payload };
    case "ADD_MEMBER":
      return { ...state, members: [...state.members, action.payload] };
    case "UPDATE_MEMBER":
      return {
        ...state,
        members: state.members.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload } : m
        ),
      };
    case "REMOVE_MEMBER":
      return {
        ...state,
        members: state.members.filter((m) => m.id !== action.payload),
      };
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };
    case "REMOVE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case "CLEAR":
      return { members: [], transactions: [] };
    default:
      return state;
  }
}

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          console.log("[ExpenseContext] INIT from storage", parsed);
          dispatch({ type: "INIT", payload: parsed });
        } catch (err) {
          console.error(
            "[ExpenseContext] Failed to parse storage value, trying backup",
            err
          );
          const rawBackup = localStorage.getItem(BACKUP_KEY);
          if (rawBackup) {
            try {
              const parsedBackup = JSON.parse(rawBackup);
              console.log(
                "[ExpenseContext] Restoring from backup",
                parsedBackup
              );
              dispatch({ type: "INIT", payload: parsedBackup });

              localStorage.setItem(STORAGE_KEY, rawBackup);
            } catch (err2) {
              console.error("[ExpenseContext] Backup parse failed", err2);
            }
          }
        }
      } else {
        console.log("[ExpenseContext] no stored state found");
      }
    } catch (e) {
      console.error("[ExpenseContext] Error reading storage", e);
    }
  }, []);

  useEffect(() => {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);

      localStorage.setItem(BACKUP_KEY, serialized);
      console.log("[ExpenseContext] persisted state", {
        members: state.members.length,
        transactions: state.transactions.length,
      });
    } catch (e) {
      console.error(
        "[ExpenseContext] Failed to persist expenses to storage",
        e
      );
    }
  }, [state]);

  const addMember = useCallback((member) => {
    const payload = { id: genId(), name: member.name || "Member", ...member };
    dispatch({ type: "ADD_MEMBER", payload });
    return payload;
  }, []);

  const updateMember = useCallback(
    (member) => dispatch({ type: "UPDATE_MEMBER", payload: member }),
    []
  );
  const removeMember = useCallback(
    (id) => dispatch({ type: "REMOVE_MEMBER", payload: id }),
    []
  );

  const addTransaction = useCallback((tx) => {
    const payload = {
      id: genId(),
      date: new Date().toISOString(),
      archived: false,
      ...tx,
    };
    console.log("[ExpenseContext] addTransaction", payload);
    dispatch({ type: "ADD_TRANSACTION", payload });
    return payload;
  }, []);

  const updateTransaction = useCallback(
    (tx) => dispatch({ type: "UPDATE_TRANSACTION", payload: tx }),
    []
  );
  const removeTransaction = useCallback(
    (id) => dispatch({ type: "REMOVE_TRANSACTION", payload: id }),
    []
  );

  const clearAll = useCallback(() => dispatch({ type: "CLEAR" }), []);

  useEffect(() => {
    try {
      window.__DONG_EXPENSES__ = () => ({ ...state });
    } catch (e) {}
    return () => {
      try {
        delete window.__DONG_EXPENSES__;
      } catch (e) {}
    };
  }, [state]);

  const value = {
    members: state.members,
    transactions: state.transactions,
    addMember,
    updateMember,
    removeMember,
    addTransaction,
    updateTransaction,
    removeTransaction,
    clearAll,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
}

export default ExpenseContext;
