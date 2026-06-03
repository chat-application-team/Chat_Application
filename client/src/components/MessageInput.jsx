function MessageInput({
  currentMessage,
  setCurrentMessage,
  handleSendMessage,
  fileInputRef,
  handleImageChange,
  setShowEmojiPicker,
  showEmojiPicker,
  emojis,
  selectedImage,
  setSelectedImage,
}) {
  const canSend = currentMessage.trim() || selectedImage;

  return (
    <div className="border-t border-violet-100 bg-[#faf9ff] px-6 py-5">

      {/* Náhled obrázku */}
      {selectedImage && (
        <div className="mx-auto mb-3 max-w-3xl">
          <div className="relative inline-block">
            <img
              src={selectedImage}
              alt="Náhled"
              className="h-20 w-20 rounded-2xl border border-violet-100 object-cover shadow-md"
            />

            {/* Odebrání obrázku před odesláním */}
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition hover:bg-rose-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Hlavní vstupní panel */}
      <div className="relative mx-auto flex max-w-3xl items-center gap-4 rounded-3xl bg-white px-5 py-2.5 shadow-[0_8px_24px_rgba(139,92,246,0.18)]">

        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden"/>

        {/* Tlačítko pro výběr souboru */}
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          title="Nahrát obrázek"
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl text-violet-400 transition hover:bg-violet-50 hover:text-violet-600"
        >
          📎
        </button>

        {/* Emoji */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Přidat emoji"
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl text-violet-400 transition hover:bg-violet-50 hover:text-violet-600"
          >
            ☺
          </button>

          {/* Seznam emoji */}
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-10 grid w-52 grid-cols-5 gap-2 rounded-3xl border border-violet-100 bg-white p-3 shadow-[0_12px_32px_rgba(139,92,246,0.18)]">
              {emojis.map((emoji, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCurrentMessage((prev) => prev + emoji)}
                  className="rounded-xl p-1 text-xl transition hover:bg-violet-50"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Formulář pro odeslání zprávy */}
        <form
          onSubmit={handleSendMessage}
          className="flex flex-1 items-center gap-3"
        >
          {/* Text zprávy */}
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Napsat zprávu..."
            className="flex-1 bg-transparent text-sm text-violet-900 outline-none placeholder:text-violet-300"
          />

          {/* Odeslání zprávy */}
          <button
            type="submit"
            disabled={!canSend}
            title="Odeslat"
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-all ${
              canSend
                ? "bg-violet-500 text-white shadow-[0_8px_20px_rgba(139,92,246,0.35)] hover:bg-violet-600 hover:scale-105"
                : "bg-violet-50 text-violet-300 cursor-not-allowed"
            }`}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}

export default MessageInput;