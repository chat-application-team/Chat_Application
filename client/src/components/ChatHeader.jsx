import ChatAvatar from "./ChatAvatar";
import UserStatus from "./UserStatus";

function ChatHeader({ chat, onOpenGroupInfo }) {

  const isGroup = chat?.is_group || chat?.isGroup || chat?.type === "group";

  const displayName =
    chat?.name ||
    chat?.other_user?.username ||
    chat?.user?.username ||
    "Soukromý chat";

  const avatar =
    chat?.image ||
    chat?.other_user?.avatar ||
    chat?.other_user?.profile?.avatar;

  return (
    <div className="h-16 bg-white border-b border-violet-100 px-6 flex items-center justify-between">

      {/* Chat name */}
      <div className="flex items-center gap-3">
        <ChatAvatar username={displayName} avatar={avatar} size="md" />

        <div>
          <h2 className="text-base font-semibold text-violet-900">
            {displayName}
          </h2>

          {/* Show group or user status */}
          {isGroup ? (
            <p className="text-xs text-violet-400">
              Skupina
            </p>
          ) : (
            <UserStatus status={chat.status || chat.user_status || chat.member_status}/>
          )}
        </div>
      </div>

      {/* Group button */}
      {isGroup && (
        <button
          onClick={onOpenGroupInfo}
          title="Správa skupiny"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm transition hover:bg-violet-100 hover:shadow-md active:scale-95">
          ⚙️
        </button>
      )}
    </div>
  );
}

export default ChatHeader;