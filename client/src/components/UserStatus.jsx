function UserStatus({ status = "offline", className = "" }) {
  // Banned falls back to offline
  const normalizedStatus =
    status === "online" || status === "dnd"
      ? status
      : "offline";

  // Visual settings
  const styles = {
    online: {
      text: "Online",
      dot: "text-emerald-500",
    },

    offline: {
      text: "Offline",
      dot: "text-gray-400",
    },

    dnd: {
      text: "Nerušit",
      dot: "text-rose-500",
    },
  };

  // Get display data for current status
  const current = styles[normalizedStatus];

  return (
    <p className={`text-xs ${current.dot} ${className}`}>
      ● {current.text}
    </p>
  );
}

export default UserStatus;