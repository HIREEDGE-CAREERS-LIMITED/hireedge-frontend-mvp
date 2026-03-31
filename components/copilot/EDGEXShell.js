// ============================================================================
// components/copilot/EDGEXShell.js
// EDGEX shell — fixed layout with mobile recent chats drawer
// ============================================================================
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEDGEXContext } from "../../context/CopilotContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  listConversations,
  deleteConversation,
  togglePinConversation,
  renameConversation,
} from "../../lib/conversations";
import EDGEXIcon from "../brand/EDGEXIcon";
import ChatWindow from "./ChatWindow";

// ─── Recent Chats Drawer (mobile only) ────────────────────────────────────────
function RecentChatsDrawer({ open, onClose, onSelect }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal]   = useState("");

  const loadConvs = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await listConversations(user.id);
    setConversations(data || []);
    setLoading(false);
  };

  useEffect(() => { if (open) loadConvs(); }, [open, user]);

  const handlePin = async (conv) => {
    setMenuOpenId(null);
    await togglePinConversation(conv.id, user.id, !conv.pinned);
    loadConvs();
  };

  const handleDelete = async (conv) => {
    setMenuOpenId(null);
    if (!window.confirm(`Delete "${conv.title || "this conversation"}"?`)) return;
    await deleteConversation(conv.id, user.id);
    loadConvs();
  };

  const handleRenameSubmit = async (conv) => {
    const trimmed = renameVal.trim();
    if (trimmed && trimmed !== conv.title) {
      await renameConversation(conv.id, user.id, trimmed);
      loadConvs();
    }
    setRenamingId(null);
  };

  if (!open) return null;

  const pinned   = conversations.filter(c => c.pinned);
  const unpinned = conversations.filter(c => !c.pinned);

  const renderConv = (conv) => {
    const isRenaming = renamingId === conv.id;
    const menuOpen   = menuOpenId === conv.id;

    return (
      <div key={conv.id} style={{ position:"relative" }}>
        {isRenaming ? (
          <div style={{ padding:"6px 16px" }}>
            <input
              autoFocus
              value={renameVal}
              onChange={e => setRenameVal(e.target.value)}
              onBlur={() => handleRenameSubmit(conv)}
              onKeyDown={e => {
                if (e.key === "Enter") handleRenameSubmit(conv);
                if (e.key === "Escape") setRenamingId(null);
              }}
              style={{ width:"100%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(15,110,86,.5)", borderRadius:7, padding:"6px 10px", color:"#fff", fontSize:13, fontFamily:"inherit", outline:"none" }}
            />
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center" }}>
            <button
              className="exs-drawer__item"
              style={{ flex:1 }}
              onClick={() => { onSelect(conv.id); onClose(); }}
            >
              {conv.pinned ? (
                <svg width="11" height="11" viewBox="0 0 18 18" fill="#0F6E56" className="exs-drawer__item-icon" style={{ flexShrink:0 }}>
                  <path d="M10.5 2.5l5 5-2 2-1.5-.5-3 3 .5 2-1.5 1.5-3-3-3 3-1-1 3-3-3-3 1.5-1.5 2 .5 3-3-.5-1.5z"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="exs-drawer__item-icon">
                  <path d="M2 2h10v8H8l-3 2V10H2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              <span className="exs-drawer__item-title">{conv.title || "Untitled conversation"}</span>
            </button>
            {/* ··· menu button */}
            <button
              onClick={() => setMenuOpenId(menuOpen ? null : conv.id)}
              type="button"
              style={{ display:"flex", alignItems:"center", justifyContent:"center", width:36, height:44, background:"transparent", border:"none", color:"rgba(255,255,255,0.28)", cursor:"pointer", flexShrink:0 }}
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="currentColor">
                <circle cx="4" cy="9" r="1.5"/><circle cx="9" cy="9" r="1.5"/><circle cx="14" cy="9" r="1.5"/>
              </svg>
            </button>
          </div>
        )}

        {/* Inline action menu */}
        {menuOpen && !isRenaming && (
          <div style={{ display:"flex", gap:4, padding:"4px 12px 8px", background:"rgba(255,255,255,0.03)", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
            {[
              { label: conv.pinned ? "Unpin" : "Pin", color:"#0F6E56", action:() => handlePin(conv) },
              { label: "Rename", color:"rgba(255,255,255,0.6)", action:() => { setRenameVal(conv.title || ""); setRenamingId(conv.id); setMenuOpenId(null); } },
              { label: "Delete", color:"#f87171", action:() => handleDelete(conv) },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.action}
                type="button"
                style={{ flex:1, padding:"6px 4px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:7, color:btn.color, fontSize:11, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

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
          {!loading && pinned.length > 0 && (
            <>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#0F6E56", opacity:.8, padding:"8px 18px 4px" }}>
                Pinned
              </div>
              {pinned.map(renderConv)}
              {unpinned.length > 0 && (
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(255,255,255,.25)", padding:"10px 18px 4px" }}>
                  Recent
                </div>
              )}
            </>
          )}
          {!loading && unpinned.map(renderConv)}
        </div>
      </div>
    </>
  );
}

// ─── Mobile Bottom Navigation ──────────────────────────────────────────────────
function MobileBottomNav() {
  const router = useRouter();
  const active = (href) => router.pathname === href || router.pathname.startsWith(href + "/");

  const items = [
    {
      href: "/copilot",
      label: "EDGEX",
      icon: (on) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <line x1="6" y1="6" x2="10.8" y2="10.8" stroke="currentColor" strokeWidth={on ? "2.4" : "2"} strokeLinecap="round"/>
          <line x1="18" y1="6" x2="13.2" y2="10.8" stroke="currentColor" strokeWidth={on ? "2.4" : "2"} strokeLinecap="round"/>
          <line x1="6" y1="18" x2="10.8" y2="13.2" stroke="currentColor" strokeWidth={on ? "2.4" : "2"} strokeLinecap="round"/>
          <line x1="18" y1="18" x2="13.2" y2="13.2" stroke="currentColor" strokeWidth={on ? "2.4" : "2"} strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      href: "/intelligence",
      label: "Intelligence",
      icon: (on) => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={on ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 16V9M9 9C9 6 7 4.5 5 4.5S1.5 6 1.5 8c0 1.5 1 2.8 2.5 3.2M9 9c0-3 2-4.5 4-4.5s3.5 1.5 3.5 3.5c0 1.5-1 2.8-2.5 3.2" />
          <path d="M5 4.5C5 3 6 1.5 7.5 1.5S9 2 9 3M13 4.5c0-1.5-1-3-2.5-3S9 2 9 3" />
        </svg>
      ),
    },
    {
      href: "/tools",
      label: "Tools",
      icon: (on) => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={on ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M11.7 1.5a4.5 4.5 0 00-3.7 7l-5.5 5.5 1.5 1.5L9.5 10a4.5 4.5 0 007-3.7l-2.6 2.6-2.1-.7-.7-2.1z" />
        </svg>
      ),
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: (on) => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={on ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
          <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" />
          <rect x="10.5" y="1.5" width="6" height="6" rx="1.5" />
          <rect x="1.5" y="10.5" width="6" height="6" rx="1.5" />
          <rect x="10.5" y="10.5" width="6" height="6" rx="1.5" />
        </svg>
      ),
    },
    {
      href: "/account",
      label: "Account",
      icon: (on) => (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={on ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="6" r="3.5" />
          <path d="M2.5 16c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="exs-bottom-nav">
      {items.map(item => {
        const on = active(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={"exs-bottom-nav__item" + (on ? " exs-bottom-nav__item--active" : "")}
          >
            <span className="exs-bottom-nav__icon">{item.icon(on)}</span>
            <span className="exs-bottom-nav__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
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

      <main className="exs-body" style={{ paddingBottom: typeof window !== "undefined" && window.innerWidth < 900 ? "56px" : "0" }}>
        <div className="exs-chat-stage">
          <ChatWindow />
        </div>
      </main>

      <MobileBottomNav />

      <RecentChatsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelect={handleSelectConv}
      />
    </div>
  );
}
