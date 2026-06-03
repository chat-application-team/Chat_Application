import { useState } from "react";
import ChatAvatar from "./ChatAvatar";
import UserStatus from "./UserStatus";
import StatusSelector from "./StatusSelector";
import { userService } from "../api/userService";


function AppHeader({
  user,
  setUser,
  logout,
  setShowAdmin,
  setIsFriendsOpen,
  setIsProfileOpen,
  friendRequests,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userStatus = user?.profile?.status || user?.status || "offline";

  const handleStatusChange = async (newStatus) => {
    const result = await userService.updateStatus(newStatus);

    if (result.success) {

      setUser(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          status: newStatus,
        },
      }));
      } else {
        alert(result.message || "Status se nepodařilo změnit.");
      }
  };

  return (
    <header className="h-20 bg-white border-b border-violet-100 px-8 flex items-center justify-between">

      {/* App logo */}
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-2xl bg-violet-500 flex items-center justify-center text-white shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-violet-700">ChatApp</h1>
      </div>

      {/* User dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-3 rounded-2xl bg-violet-50 px-4 py-3 transition hover:bg-violet-100"
        >
          <ChatAvatar username={user?.username || "Uživatel"} size="sm" />

          <div className="text-left">
            <p className="text-sm font-semibold text-violet-800">
              {user?.username || "Uživatel"}
            </p>

            {/* Current user status */}
            <UserStatus status={userStatus} />
          </div>

          <span className="text-violet-400 text-xs">
            {isMenuOpen ? "⌃" : "⌄"}
          </span>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-3 w-60 rounded-3xl bg-white border border-violet-100 shadow-xl overflow-hidden z-50">

            {/* User info */}
            <div className="p-5 flex items-center gap-3 border-b border-violet-100">
              <ChatAvatar username={user?.username || "Uživatel"} />

              <div>
                <p className="font-semibold text-violet-800">
                  {user?.username || "Uživatel"}
                </p>

                {/* Status selector */}
                <StatusSelector
                  status={userStatus}
                  onChange={handleStatusChange}
                />
              </div>
            </div>

            {/* Menu actions */}
            <div className="p-2">

              <button
                onClick={() => {
                  setIsProfileOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-2xl text-violet-700 hover:bg-violet-50 transition"
              >
                Profil
              </button>

              <button
                onClick={() => {
                  setIsFriendsOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-2xl text-violet-700 hover:bg-violet-50 transition flex items-center justify-between"
              >
                <span>Přátelé</span>

                {friendRequests.length > 0 && (
                  <span className="min-w-5 h-5 flex items-center justify-center rounded-full bg-violet-500 text-white text-[11px] font-semibold px-1.5">
                    {friendRequests.length}
                  </span>
                )}
              </button>

              {user?.role === "admin" && (
                <button
                  onClick={() => {
                    setShowAdmin(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-2xl text-violet-700 hover:bg-violet-50 transition"
                >
                  Admin
                </button>
              )}
              <div className="my-2 border-t border-violet-100" />

              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 transition"
              >
                Odhlásit
              </button>

            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default AppHeader;