/*TEMP, replace all*/
/*Will use actual avatar instead*/

const avatarColors = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-pink-500",
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
];

const getColor = (username = "") => {
  const charCode = username.charCodeAt(0) || 0;
  return avatarColors[charCode % avatarColors.length];
};

function ChatAvatar({ username, size = "md" }) {
  const initial = username?.charAt(0)?.toUpperCase() || "U";

  const sizes = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
  };

  return (
    <div
      className={`
        ${sizes[size]}
        ${getColor(username)}
        rounded-2xl
        text-white
        flex items-center justify-center
        font-semibold
        leading-none
        shadow-md
      `}
    >
      {initial}
      
    </div>
  );
}

export default ChatAvatar;