import React, { useState, useContext } from "react";

import ExpenseContext from "../components/ExpenseContext";
import ConfirmDialog from "./ConfirmDialog";

import { ThemeContext } from "./ThemeContext";

export default function MembersPanel() {
  const { members, addMember, updateMember, removeMember } =
    useContext(ExpenseContext);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme ?? "light";

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toRemove, setToRemove] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addMember({ name: name.trim() });
    setName("");
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditingName(m.name);
  };
  const saveEdit = (e) => {
    e.preventDefault();
    if (!editingName.trim()) return;
    updateMember({ id: editingId, name: editingName.trim() });
    setEditingId(null);
    setEditingName("");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const confirmRemove = (m) => {
    setToRemove(m);
    setConfirmOpen(true);
  };

  const doRemove = () => {
    if (toRemove) removeMember(toRemove.id);
    setConfirmOpen(false);
    setToRemove(null);
  };

  return (
    <div
      className={`${
        theme === "light" ? "bg-white" : "bg-gray-800"
      } rounded-lg shadow-sm p-4`}
    >
      <h4 className="text-sm text-gray-600 mb-2">Members</h4>

      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          className="flex-1 p-2 rounded border"
          placeholder="Add member"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="p-2 bg-indigo-600 text-white rounded">
          Add
        </button>
      </form>

      <ul className="space-y-2 text-sm">
        {members.length === 0 && (
          <li className="text-gray-500">No members yet</li>
        )}
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between">
            {editingId === m.id ? (
              <form onSubmit={saveEdit} className="flex gap-2 w-full">
                <input
                  className="flex-1 p-1 rounded border"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-green-600 text-white rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-2 py-1 rounded border"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span>{m.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(m)}
                    className="text-sm px-2 py-1 rounded border"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmRemove(m)}
                    className="text-sm px-2 py-1 rounded border text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={confirmOpen}
        title={`Remove member "${toRemove?.name}"?`}
        description="Removing a member will NOT delete transactions. You can restore later by re-adding the member and editing transactions if needed."
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={doRemove}
        onCancel={() => {
          setConfirmOpen(false);
          setToRemove(null);
        }}
      />
    </div>
  );
}
