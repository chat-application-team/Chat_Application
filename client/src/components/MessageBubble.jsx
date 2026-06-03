import ChatAvatar from "./ChatAvatar";

function MessageBubble({ msg, isMine }) {
  const text = msg.text || msg.content;
  // Idk formatting rn
  const image = msg.image || msg.image_url || msg.file_url;

  // Jméno autora zprávy
    const senderName =
    msg.senderName ||
    msg.sender_username ||
    msg.username ||
    msg.sender?.username ||
    "Uživatel";

  // Formátování času odeslání
  const time = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString("cs-CZ", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className={`flex items-start ${isMine ? "justify-end" : "justify-start"}`}>
      
      {/* Avatar u cizích zpráv */}
      {!isMine && (
        <div className="mr-3 mt-6">
          <ChatAvatar username={senderName} size="sm" />
        </div>
      )}

      <div className="max-w-[65%]">

        {/* Autor u cizích zpráv */}
        {!isMine && (
          <p className="mb-1 ml-1 text-xs font-semibold text-violet-500">
            {senderName}
          </p>
        )}

        {/* Zpráva */}
        <div
          className={`rounded-3xl px-5 py-3 shadow-sm ${
            isMine
              ? "bg-violet-500 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          {/* Obrázky */}
          {image && (
            <img
              src={image}
              alt="Obrázek"
              className="mb-2 max-h-64 max-w-full rounded-2xl object-cover"
            />
          )}

          {/* Text zprávy */}
          {text && (
            <p className="text-sm leading-relaxed">
              {text}
            </p>
          )}
        </div>

        {/* Čas odeslání */}
        <p
          className={`mt-1 text-xs ${
            isMine
              ? "text-right text-violet-300"
              : "text-violet-300"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}

export default MessageBubble;