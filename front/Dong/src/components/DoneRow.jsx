import React from "react";

export default function DoneRow({ doneItems = [], onToggle }) {
  const count = doneItems.length;
  const last = doneItems[0];

  const [expanded, setExpanded] = React.useState(false);

  const handleClick = () => {
    const next = !expanded;
    setExpanded(next);
    if (onToggle) onToggle(next);
  };

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-medium">
            ✓
          </div>
          <div className="text-left">
            <div className="font-medium">Done</div>
            <div className="text-sm text-gray-500">
              {count === 0
                ? "No done transactions"
                : `${count} transaction${count > 1 ? "s" : ""} — ${
                    last?.description || ""
                  }`}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {expanded ? "Hide" : "Show"}
        </div>
      </button>

      {expanded && count > 0 && (
        <div className="mt-2 bg-white dark:bg-gray-800 rounded-md shadow-sm divide-y">
          {doneItems.map((tx) => (
            <div key={tx.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                  {String(tx.payer || "U")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">
                    {tx.description || "Expense"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(tx.date).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                {Number(tx.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
