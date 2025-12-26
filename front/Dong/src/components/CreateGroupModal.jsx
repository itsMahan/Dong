import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";
import ExpenseContext from "./ExpenseContext";

export default function CreateGroupModal({ open, onClose }) {
    const [name, setName] = useState("");
    const [members, setMembers] = useState([{ name: "" }]);
    const [submitting, setSubmitting] = useState(false);
    const { theme } = useContext(ThemeContext);
    const { addGroup } = useContext(ExpenseContext);
    const navigate = useNavigate();

    const handleMemberChange = (index, value) => {
        const newMembers = [...members];
        newMembers[index].name = value;
        setMembers(newMembers);
    };

    const addMember = () => {
        setMembers([...members, { name: "" }]);
    };

    const removeMember = (index) => {
        const newMembers = members.filter((_, i) => i !== index);
        setMembers(newMembers);
    };

    const guardedSubmit = async () => {
        if (submitting) return;
        try {
            setSubmitting(true);
            const group = {
                title: name,
                members: members.filter((m) => m.name.trim() !== ""),
            };
            const newGroup = await addGroup(group);
            if (newGroup) {
                navigate(`/group/${newGroup.id}`);
            }
            if (typeof onClose === "function") onClose();
        } catch (err) {
            console.error("CreateGroupModal submit error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div
                className={`relative w-full max-w-lg rounded-lg p-6 ${
                    theme === "light" ? "bg-white" : "bg-gray-800"
                }`}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Create new Tricount</h3>
                    <button type="button" onClick={onClose} className="text-gray-600">
                        ✕
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm mb-1">Tricount name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 rounded border"
                        placeholder="e.g., Weekend Trip"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm mb-1">Members</label>
                    {members.map((member, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <input
                                value={member.name}
                                onChange={(e) => handleMemberChange(index, e.target.value)}
                                className="w-full p-2 rounded border"
                                placeholder={`Member ${index + 1}`}
                            />
                            <button
                                type="button"
                                onClick={() => removeMember(index)}
                                className="text-red-500"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addMember}
                        className="text-indigo-600"
                    >
                        + Add member
                    </button>
                </div>

                <div className="flex items-center gap-2 mt-6">
                    <button
                        type="button"
                        onClick={guardedSubmit}
                        disabled={submitting}
                        className="p-2 bg-indigo-600 text-white rounded"
                    >
                        {submitting ? "Creating..." : "Create"}
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
