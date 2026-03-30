// ============================================================================
// components/copilot/EDGEXShell.js
// EDGEX shell — fixed layout with mobile recent chats drawer
// ============================================================================
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useEDGEXContext } from "../../context/CopilotContext";
import { useAuth } from "../../contexts/AuthContext";
import { listConversations } from "../../lib/conversations";
import EDGEXIcon from "../brand/EDGEXIcon";
import ChatWindow from "./ChatWindow";

// ─── Recent Chats Drawer (mobile only) ────────────────────────────────────────
function RecentChatsDrawer({ open, onClose, onSelect }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    listConversations(user.id).then(({ data }) => {
      setConversations(data || []);
      setLoading(false);
    });
  }, [open, user]);

  if (!open) return null;

  return (
    <>
      <div className="exs-drawer-backdrop" onClick={onClose} />
      <div className="exs-drawer" role="dialog" aria-modal="true">
        <div className="exs-drawer__handle" />
        <div className="exs-drawer__header">
          <span className="exs-drawer__title">Recent Chats</span>
          <button className="exs-drawer__close" onClick={onClose}>✕</button>
        </div>
        <div className="exs-drawer__list">
          {loading && (
            <div className="exs-drawer__loading">
              <span className="exs-drawer__dot" />
              <span className="exs-drawer__dot" />
              <span className="exs-drawer__dot" />
            </div>
          )}
          {!loading && conversations.length === 0 && (
            <p className="exs-drawer__empty">No conversations yet. Start a chat below.</p>
          )}
          {!loading && conversations.map(conv => (
            <button
              key={conv.id}
              className="exs-drawer__item"
              onClick={() => { onSelect(conv.id); onClose(); }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="exs-drawer__item-icon">
                <path d="M2 2h10v8H8l-3 2V10H2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="exs-drawer__item-title">
                {conv.title || "Untitled conversation"}
              </span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="exs-drawer__item-arrow">
                <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default function EDGEXShell() {
  const router = useRouter();
  const { triggerNewChat, setConversationId } = useEDGEXContext();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  const handleSelectConv = (convId) => {
    setConversationId(convId);
    router.replace(`${router.pathname}?conv=${convId}`, undefined, { shallow: true });
  };

  return (
    <div className="exs-shell">
      <header className="exs-header">
        <div className="exs-header__brand">
          <button
            className="exs-header__back"
            onClick={handleBack}
            type="button"
            aria-label="Go back"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="exs-header__icon-wrap">
            <EDGEXIcon size={15} state="header" color="#0F6E56" />
          </div>
          <span className="exs-header__name">EDGEX</span>
          <span className="exs-header__sep" />
          <span className="exs-header__sub">Career Intelligence</span>
        </div>

        <div className="exs-header__actions">
          <button
            className="exs-header__history"
            onClick={() => setDrawerOpen(true)}
            type="button"
            aria-label="Recent chats"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M8 5v3.5l2.2 2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="exs-header__new"
            onClick={triggerNewChat}
            type="button"
          >
            New chat
          </button>
        </div>
      </header>

      <main className="exs-body">
        <div className="exs-chat-stage">
          <ChatWindow />
        </div>
      </main>

      <RecentChatsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelect={handleSelectConv}
      />
    </div>
  );
}
