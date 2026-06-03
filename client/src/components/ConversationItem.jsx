import ChatAvatar from "./ChatAvatar";
import UserStatus from "./UserStatus";

function ConversationItem({ chat, isActive, onClick }) {

  const unread = chat.unread_count || chat.unread || 0;
  const isGroup = chat.is_group || chat.isGroup;

  // Pouze pro user chaty
  const userStatus = chat.status || "offline";

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 rounded-3xl px-4 py-3 cursor-pointer transition-all ${
        isActive ? "bg-white shadow-sm border-l-4 border-violet-500" : "hover:bg-white/70 hover:shadow-sm"
      }`}
    >
      <ChatAvatar username={chat.name} size="md" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-violet-900">
          {chat.name}
        </p>

        {isGroup ? (
          <p className="text-xs text-violet-400">Skupina</p>
        ) : (
          <UserStatus status={userStatus} />
        )}
      </div>

      {unread > 0 && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-violet-500 px-2 text-xs font-semibold text-white">
          {unread}
        </span>
      )}
    </div>
  );
}

export default ConversationItem;