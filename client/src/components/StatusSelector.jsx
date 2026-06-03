import { useState } from "react";
import UserStatus from "./UserStatus";

function StatusSelector({ status, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  // Available user statuses
  const options = [
    { value: "online", label: "Online" },
    { value: "dnd", label: "Nerušit" },
  ];

  return (
    <div className="relative">

      {/* Current status button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <UserStatus status={status} />
      </button>

      {/* Status selection dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-32 rounded-2xl border border-violet-100 bg-white p-2 shadow-lg">

          {/* Render all available status options */}
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                // Update selected status
                onChange(option.value);

                // Close dropdown after selection
                setIsOpen(false);
              }}
              className="w-full rounded-xl px-3 py-2 text-left hover:bg-violet-50"
            >
              <UserStatus status={option.value} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default StatusSelector;