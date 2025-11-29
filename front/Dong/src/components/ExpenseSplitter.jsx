import React, { useState, useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export default function ExpenseSplitter() {
    const [items, setItems] = useState([]);
    const [itemName, setItemName] = useState("");
    const [itemPrice, setItemPrice] = useState("");
    const [participants, setParticipants] = useState([]);
    const [participantName, setParticipantName] = useState("");
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [shares, setShares] = useState({});
    const [paidShares, setPaidShares] = useState({}); // New state for paid shares

    const { theme } = useContext(ThemeContext);

    const resetCalculations = () => {
        setShares({});
        setPaidShares({});
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        if (itemName && itemPrice > 0 && selectedParticipants.length > 0) {
            setItems([...items, { name: itemName, price: parseFloat(itemPrice), participants: selectedParticipants }]);
            setItemName("");
            setItemPrice("");
            setSelectedParticipants([]);
            resetCalculations(); // Clear shares and paid status when items change
        }
    };

    const handleRemoveItem = (indexToRemove) => {
        setItems((prevItems) => prevItems.filter((_, index) => index !== indexToRemove));
        resetCalculations(); // Clear shares and paid status when items change
    };

    const handleAddParticipant = (e) => {
        e.preventDefault();
        if (participantName && !participants.includes(participantName)) {
            setParticipants([...participants, participantName]);
            setParticipantName("");
            resetCalculations(); // Clear shares and paid status when participants change
        }
    };

    const handleRemoveParticipant = (participantToRemove) => {
        // Remove from participants list
        setParticipants((prevParticipants) =>
            prevParticipants.filter((p) => p !== participantToRemove)
        );

        // Remove from selectedParticipants for the current item being added
        setSelectedParticipants((prevSelected) =>
            prevSelected.filter((p) => p !== participantToRemove)
        );

        // Update existing items to remove the participant if they were part of it
        setItems((prevItems) =>
            prevItems.map((item) => ({
                ...item,
                participants: item.participants.filter((p) => p !== participantToRemove),
            }))
        );

        resetCalculations(); // Clear shares and paid status as they are now invalid
    };

    const handleToggleParticipant = (participant) => {
        setSelectedParticipants((prev) =>
            prev.includes(participant)
                ? prev.filter((p) => p !== participant)
                : [...prev, participant]
        );
    };

    const handleTogglePaid = (participant) => {
        setPaidShares((prevPaidShares) => ({
            ...prevPaidShares,
            [participant]: !prevPaidShares[participant],
        }));
    };

    const calculateShares = () => {
        const newShares = {};
        const initialPaidShares = {}; // Initialize paid status for all participants
        participants.forEach(p => {
            newShares[p] = 0;
            initialPaidShares[p] = false; // Default to unpaid
        });

        items.forEach(item => {
            // Only process items that have participants
            if (item.participants.length > 0) {
                const sharePerPerson = item.price / item.participants.length;
                item.participants.forEach(p => {
                    // Ensure the participant still exists in the overall participants list
                    if (newShares.hasOwnProperty(p)) {
                        newShares[p] += sharePerPerson;
                    }
                });
            }
        });

        setShares(newShares);
        setPaidShares(initialPaidShares); // Reset paid status on recalculation
    };

    // Adjusted input and button classes for a more mobile-friendly feel
    const inputClasses = `py-3 px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        theme === "light"
            ? "bg-white text-black placeholder-gray-500 border-gray-300"
            : "bg-gray-800 text-white placeholder-gray-400 border-gray-600"
    }`;
    const buttonClasses = `py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${
        theme === "light"
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-blue-700 text-white hover:bg-blue-800"
    }`;
    const secondaryButtonClasses = `py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${
        theme === "light"
            ? "bg-gray-300 text-black hover:bg-gray-400"
            : "bg-gray-600 text-white hover:bg-gray-700"
    }`;

    return (
        <div className="flex flex-col gap-6 p-4 max-w-md mx-auto w-full"> {/* Narrower max-width for mobile feel */}
            <h3 className="text-2xl font-bold text-center">Expense Splitter</h3>

            {/* Add Participants */}
            <div className="bg-base-200 p-5 rounded-xl shadow-lg"> {/* Increased padding, rounded corners, shadow */}
                <h4 className="text-xl font-semibold mb-3">Add Participants</h4>
                <form onSubmit={handleAddParticipant} className="flex flex-col sm:flex-row gap-3 mb-4">
                    <input
                        type="text"
                        placeholder="Participant Name"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        className={`${inputClasses} flex-grow`}
                        required
                    />
                    <button type="submit" className={buttonClasses}>Add</button>
                </form>
                {participants.length > 0 && (
                    <div>
                        <p className="font-medium mb-2 text-lg">Current Participants:</p>
                        <div className="flex flex-wrap gap-2">
                            {participants.map((p) => (
                                <span key={p} className="badge badge-lg bg-gray-200 text-gray-800 py-2 px-3 rounded-full flex items-center gap-1 text-base">
                                    {p}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveParticipant(p)}
                                        className="btn btn-xs btn-circle btn-ghost text-red-500"
                                        aria-label={`Remove ${p}`}
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Items */}
            <div className="bg-base-200 p-5 rounded-xl shadow-lg">
                <h4 className="text-xl font-semibold mb-3">Add Item</h4>
                <form onSubmit={handleAddItem} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Item Name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className={inputClasses}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        className={inputClasses}
                        min="0.01"
                        step="0.01"
                        required
                    />
                    {participants.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            <p className="font-medium w-full text-lg">Who shared this item?</p>
                            {participants.map((p) => (
                                <label key={p} className="flex items-center gap-2 cursor-pointer text-base">
                                    <input
                                        type="checkbox"
                                        checked={selectedParticipants.includes(p)}
                                        onChange={() => handleToggleParticipant(p)}
                                        className="checkbox checkbox-md"
                                    />
                                    {p}
                                </label>
                            ))}
                        </div>
                    )}
                    <button type="submit" className={buttonClasses}>Add Item</button>
                </form>
                {items.length > 0 && (
                    <div className="mt-5">
                        <p className="font-medium mb-2 text-lg">Added Items:</p>
                        <ul className="list-none pl-0 space-y-3">
                            {items.map((item, index) => (
                                <li key={index} className="flex items-center justify-between gap-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                                    <span className="text-base flex-grow">
                                        {item.name}: <span className="font-semibold">${item.price.toFixed(2)}</span> (Shared by: {item.participants.join(", ") || "None"})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="btn btn-sm btn-circle btn-ghost text-red-500"
                                        aria-label={`Remove ${item.name}`}
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Calculate Shares */}
            {items.length > 0 && participants.length > 0 && (
                <div className="bg-base-200 p-5 rounded-xl shadow-lg">
                    <button onClick={calculateShares} className={`${buttonClasses} w-full mb-4`}>
                        Calculate Shares
                    </button>
                    {Object.keys(shares).length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-xl font-semibold mb-3">Individual Shares:</h4>
                            <ul className="list-none pl-0 space-y-3">
                                {Object.entries(shares).map(([p, amount]) => (
                                    <li key={p} className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                                        <label className="flex items-center gap-2 cursor-pointer flex-grow">
                                            <input
                                                type="checkbox"
                                                checked={!!paidShares[p]}
                                                onChange={() => handleTogglePaid(p)}
                                                className="checkbox checkbox-md"
                                            />
                                            <span className={`${paidShares[p] ? "line-through text-gray-500 dark:text-gray-400" : "text-black dark:text-white"} text-base font-medium`}>
                                                {p}: <span className="font-semibold">${amount.toFixed(2)}</span>
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}