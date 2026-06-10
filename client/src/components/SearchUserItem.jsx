import ChatAvatar from "./ChatAvatar";

function SearchUserItem({
  foundUser,
  isSent,
  onSendRequest,
  onStartChat,
}) {
  return (
    <div
      onClick={onStartChat}
      className="flex items-center gap-3 rounded-3xl px-4 py-3 bg-white border border-violet-100 shadow-sm cursor-pointer transition hover:border-violet-200 hover:shadow-md"
    >
      {/* Avatar */}
      <ChatAvatar
        username={foundUser.username}
        size="md"
      />

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-violet-900">
          {foundUser.username}
        </p>

        <p className="text-xs text-violet-400">
          {foundUser.email || "Uživatel"}
        </p>
      </div>

      {/* Žádost o přátelství */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSendRequest(e, foundUser.id);
        }}
        disabled={isSent}
        className={`rounded-2xl px-4 py-2 text-xs font-semibold transition ${
          isSent
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-violet-500 text-white hover:bg-violet-600"
        }`}
      >
        {isSent ? "Odesláno" : "+ Přidat"}
      </button>
    </div>
  );
}

export default SearchUserItem;