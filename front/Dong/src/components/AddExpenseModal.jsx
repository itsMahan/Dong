import React, { useState, useEffect, useContext } from "react";
import ExpenseContext from "../components/ExpenseContext";
import { ThemeContext } from "./ThemeContext";

export default function AddExpenseModal({
  open,
  onClose,
  onSave,
  members = [],
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [payer, setPayer] = useState(members[0]?.id ?? "");
  const [selected, setSelected] = useState(() => members.map((m) => m.id));
  const [submitting, setSubmitting] = useState(false);

  const { addTransaction: ctxAddTransaction } =
    useContext(ExpenseContext) || {};
  const { theme } = useContext(ThemeContext) || { theme: "light" };

  useEffect(() => {
    if (open) {
      setAmount("");
      setDescription("");
      setPayer(members[0]?.id ?? "");
      setSelected(members.map((m) => m.id));
      setSubmitting(false);
    }
  }, [open, members]);

  useEffect(() => {
    if (members.length > 0 && !members.find((m) => m.id === payer)) {
      setPayer(members[0].id);
    }
    setSelected((s) => {
      const ids = members.map((m) => m.id);
      return s.filter((id) => ids.includes(id));
    });
  }, [members]);

  const toggleMember = (id) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  };

  const guardedSubmit = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const num = Number(amount);
      if (!amount || isNaN(num)) {
        console.warn("AddExpenseModal: invalid amount", amount);
        setSubmitting(false);
        return;
      }
      const expense = {
        amount: num,
        description: description || "",
        payer: payer || (members[0]?.id ?? ""),
        participants:
          Array.isArray(selected) && selected.length > 0
            ? selected
            : members.map((m) => m.id),
        date: new Date().toISOString(),
        archived: false,
      };

      console.log("[AddExpenseModal] submit", expense);
      if (typeof onSave === "function") {
        await Promise.resolve(onSave(expense));
      } else if (ctxAddTransaction) {
        ctxAddTransaction(expense);
      } else {
        console.warn("No onSave and no context.addTransaction available");
      }
      if (typeof onClose === "function") onClose();
    } catch (err) {
      console.error("AddExpenseModal submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative w-full rounded-t-lg p-4 max-h-[70vh] overflow-auto ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Add expense</h3>
          <button type="button" onClick={onClose} className="text-gray-600">
            ✕
          </button>
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 rounded border"
            placeholder="0.00"
            aria-label="amount"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded border"
            placeholder="Dinner, taxi..."
            aria-label="description"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Paid by</label>
          <select
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
            className="w-full p-2 rounded border"
          >
            {members.length === 0 ? (
              <option value="">No members</option>
            ) : (
              members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="mb-3">
          <div className="text-sm mb-1">Split with</div>
          <div className="grid grid-cols-2 gap-2">
            {members.map((m) => (
              <label
                key={m.id}
                className="flex items-center gap-2 p-2 border rounded"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(m.id)}
                  onChange={() => toggleMember(m.id)}
                />
                <span className="text-sm">{m.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={guardedSubmit}
            disabled={submitting}
            className="p-2 bg-indigo-600 text-white rounded"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded border"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
