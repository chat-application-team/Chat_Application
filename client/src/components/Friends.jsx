import { useState, useEffect } from "react";
import { socialService } from "../api/socialService";
import ChatAvatar from "./ChatAvatar";
import UserStatus from "./UserStatus";

function Friends({ onClose, requests, setRequests }) {
    const [activeTab, setActiveTab] = useState('friends');
    const [friends, setFriends] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);

    const tabs = [
      { id: "friends", label: "Přátelé", count: friends.length },
      { id: "requests", label: "Žádosti", count: requests.length },
      { id: "blocked", label: "Blokovaní", count: blockedUsers.length },
    ];
  
    useEffect(() => {
      const loadFriends = async () => {
        const friendsData = await socialService.getFriends();
        setFriends(friendsData);
      };

      const loadBlockedUsers = async () => {
        const blockedData = await socialService.getBlockedUsers();
        setBlockedUsers(blockedData);
      };

      if (activeTab === "friends") {
        loadFriends();
      }

      if (activeTab === "blocked") {
        loadBlockedUsers();
      }
    }, [activeTab]);

    const handleResponse = async (id, accept) => {
      const result = await socialService.respondToRequest(id, accept);
      if (result.success) {
        setRequests(prev => prev.filter(r => r.id !== id));
        if (accept) {
          const updatedFriends = await socialService.getFriends();
          setFriends(updatedFriends);
        }
      }
    };

    const handleBlock = async (userId) => {
      if(window.confirm("Zablokovat tohoto uživatele?")) {
        const result = await socialService.blockUser(userId);
        if (result.success) {
          setFriends(prev => prev.filter(f => f.id !== userId));
        }
      }
    };

    const handleUnblockUser = async (userId) => {
      const result = await socialService.unblockUser(userId);

      if (result.success) {
        setBlockedUsers(prev =>
          prev.filter(u => u.id !== userId)
        );
      }
    };

    /*
    const handleReport = async (userId) => {
      if(window.confirm("Opravdu chcete tohoto uživatele nahlásit administrátorům?")) {
        await socialService.reportUser(userId);
        alert("Uživatel byl nahlášen.");
      }
    };
    */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="relative flex max-h-[80vh] min-h-[430px] w-full max-w-md flex-col rounded-3xl border border-violet-100 bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-xl font-bold text-violet-300 transition hover:text-violet-700"
        >
          &times;
        </button>

        <div className="border-b border-violet-100 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
            Sociální centrum
          </p>
          <h2 className="mt-1 text-2xl font-bold text-violet-900">
            Přátelé a žádosti
          </h2>
        </div>

        <div className="border-b border-violet-100 px-4 pt-4">
          <div className="flex gap-2 rounded-3xl bg-violet-50 p-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-violet-400 hover:text-violet-700"
                }`}
              >
                {tab.label}

                {tab.count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 text-[11px] font-semibold text-white">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "friends" && (
            <div className="space-y-3">
              {friends.length === 0 ? (
                <p className="mt-8 text-center text-sm text-violet-300">
                  Zatím nemáš žádné přátele.
                </p>
              ) : (
                friends.map((friend) => (
                  <div
                    key={`friend-${friend.id}`}
                    className="flex items-center gap-3 rounded-3xl border border-violet-100 bg-violet-50/40 px-4 py-3"
                  >
                    <ChatAvatar username={friend.username} size="md" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-violet-900">
                        {friend.username}
                      </p>
                      <UserStatus status={friend.status} />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBlock(friend.id)}
                      className="rounded-2xl px-3 py-2 text-xs font-semibold text-rose-500 transition hover:bg-rose-50"
                    >
                      Blokovat
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-3">
              {requests.length === 0 ? (
                <p className="mt-8 text-center text-sm text-violet-300">
                  Žádné nové žádosti o přátelství.
                </p>
              ) : (
                requests.map((req) => (
                  <div
                    key={`req-${req.id}`}
                    className="rounded-3xl border border-violet-100 bg-violet-50/40 px-4 py-3"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <ChatAvatar username={req.username} size="md" />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-violet-900">
                          {req.username}
                        </p>
                        <p className="text-xs text-violet-400">
                          Chce si tě přidat do přátel
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleResponse(req.id, false)}
                        className="rounded-2xl bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-600 transition hover:bg-violet-100"
                      >
                        Odmítnout
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResponse(req.id, true)}
                        className="rounded-2xl bg-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-600"
                      >
                        Přijmout
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "blocked" && (
            <div className="space-y-3">
              {blockedUsers.length === 0 ? (
                <p className="mt-8 text-center text-sm text-violet-300">
                  Zatím jsi nikoho nezablokoval.
                </p>
              ) : (
                blockedUsers.map((user) => (
                  <div
                    key={`blocked-${user.id}`}
                    className="flex items-center gap-3 rounded-3xl border border-rose-100 bg-rose-50/50 px-4 py-3"
                  >
                    <ChatAvatar
                      username={user.username || "Neznámý"}
                      size="md"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-rose-900">
                        {user.username || "Neznámý"}
                      </p>
                      <p className="text-xs text-rose-400">
                        Zablokovaný uživatel
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUnblockUser(user.id)}
                      className="rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-rose-500 shadow-sm transition hover:bg-rose-50"
                    >
                      Odblokovat
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Friends;
