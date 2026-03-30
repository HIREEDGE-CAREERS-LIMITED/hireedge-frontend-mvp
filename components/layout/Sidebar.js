// ============================================================================
// components/layout/Sidebar.js
// HireEdge Frontend — Sidebar navigation with conversation management
// Features: pin, delete, rename — ChatGPT-style
// ============================================================================
import { useRouter } from "next/router";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { NAV_SECTIONS, ACCOUNT_NAV } from "../../config/navigation";
import EDGEXIcon from "../brand/EDGEXIcon";
import HireEdgeLogo from "../brand/HireEdgeLogo";
import { useAuth } from "../../contexts/AuthContext";
import { useEDGEXContext } from "../../context/CopilotContext";
import {
  listConversations,
  deleteConversation,
  togglePinConversation,
  renameConversation,
} from "../../lib/conversations";

const PLAN_LABELS = {
  free: "Free",
  career_pack: "Career Pack",
  pro: "Pro",
  elite: "Elite",
};

const ICONS = {
  spark: (<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1v4M9 13v4M1 9h4M13 9h4M3.5 3.5l2.8 2.8M11.7 11.7l2.8 2.8M3.5 14.5l2.8-2.8M11.7 6.3l2.8-2.8" /></svg>),
  grid: (<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="6" height="6" rx="1.5" /><rect x="10.5" y="1.5" width="6" height="6" rx="1.5" /><rect x="1.5" y="10.5" width="6" height="6" rx="1.5" /><rect x="10.5" y="10.5" width="6" height="6" rx="1.5" /></svg>),
  brain: (<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 16V9M9 9C9 6 7 4.5 5 4.5S1.5 6 1.5 8c0 1.5 1 2.8 2.5 3.2M9 9c0-3 2-4.5 4-4.5s3.5 1.5 3.5 3.5c0 1.5-1 2.8-2.5 3.2" /><path d="M5 4.5C5 3 6 1.5 7.5 1.5S9 2 9 3M13 4.5c0-1.5-1-3-2.5-3S9 2 9 3" /></svg>),
  wrench: (<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11.7 1.5a4.5 4.5 0 00-3.7 7l-5.5 5.5 1.5 1.5L9.5 10a4.5 4.5 0 007-3.7l-2.6 2.6-2.1-.7-.7-2.1z" /></svg>),
  package: (<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5L9 2l7 3.5M2 5.5v7L9 16l7-3.5v-7M2 5.5L9 9m0 7V9m0 0l7-3.5" /></svg>),
  user: (<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="3.5" /><path d="M2.5 16c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" /></svg>),
  "credit-card": (<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="3.5" width="15" height="11" rx="2" /><path d="M1.5 7.5h15" /></svg>),
  chevron: (<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4l5 5-5 5" /></svg>),
  logout: (<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 9h9M12 5.5l3.5 3.5L12 12.5" /><path d="M10 3H3.5A1.5 1.5 0 002 4.5v9A1.5 1.5 0 003.5 15H10" /></svg>),
  plus: (<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M9 3v12M3 9h12" /></svg>),
  chat: (<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 11a6.5 6.5 0 01-9 2.5L2 14.5l1-4.5a6.5 6.5 0 1112.5 1z" /></svg>),
  pin: (<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 2.5l5 5-2 2-1.5-.5-3 3 .5 2-1.5 1.5-3-3-3 3-1-1 3-3-3-3 1.5-1.5 2 .5 3-3-.5-1.5z" /></svg>),
  pinFilled: (<svg viewBox="0 0 18 18" fill="currentColor" stroke="none"><path d="M10.5 2.5l5 5-2 2-1.5-.5-3 3 .5 2-1.5 1.5-3-3-3 3-1-1 3-3-3-3 1.5-1.5 2 .5 3-3-.5-1.5z" /></svg>),
  pencil: (<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2.5l2.5 2.5-9 9H4v-2.5l9-9z" /></svg>),
  trash: (<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h12M7 5V3h4v2M5 5l1 10h6l1-10" /></svg>),
  dots: (<svg viewBox="0 0 18 18" fill="currentColor" stroke="none"><circle cx="4" cy="9" r="1.5"/><circle cx="9" cy="9" r="1.5"/><circle cx="14" cy="9" r="1.5"/></svg>),
};

function getIcon(name) { return ICONS[name] || ICONS.grid; }

function EDGEXNavIcon() {
  return (
    <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:18, height:18 }}>
      <EDGEXIcon size={16} state="header" color="currentColor" />
    </span>
  );
}

// ─── Conversation context menu ─────────────────────────────────────────────────
function ConvMenu({ conv, onPin, onRename, onDelete, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        right: 0,
        top: "100%",
        zIndex: 200,
        background: "var(--ink-800, #181a22)",
        border: "1px solid var(--border-default)",
        borderRadius: 10,
        padding: "4px",
        minWidth: 160,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        animation: "ex-in .12s ease",
      }}
    >
      {[
        { icon: conv.pinned ? "pinFilled" : "pin",  label: conv.pinned ? "Unpin" : "Pin",    color: "#0F6E56", action: onPin    },
        { icon: "pencil",                            label: "Rename",                          color: null,      action: onRename },
        { icon: "trash",                             label: "Delete",                          color: "#f87171", action: onDelete },
      ].map(item => (
        <button
          key={item.label}
          onClick={(e) => { e.stopPropagation(); item.action(); onClose(); }}
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "7px 10px",
            background: "transparent",
            border: "none",
            borderRadius: 7,
            cursor: "pointer",
            color: item.color || "var(--text-secondary)",
            fontSize: 12,
            fontFamily: "inherit",
            fontWeight: 500,
            transition: "background .12s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ width:14, height:14, display:"flex", flexShrink:0, color: item.color || "inherit" }}>
            {getIcon(item.icon)}
          </span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ─── Single conversation row ───────────────────────────────────────────────────
function ConvRow({ conv, isActive, onSelect, onPin, onRename, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(conv.title || "New conversation");
  const inputRef = useRef(null);

  useEffect(() => {
    if (renaming && inputRef.current) inputRef.current.focus();
  }, [renaming]);

  const handleRenameSubmit = () => {
    const trimmed = renameVal.trim();
    if (trimmed && trimmed !== conv.title) onRename(trimmed);
    setRenaming(false);
  };

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); if (!menuOpen) setMenuOpen(false); }}
    >
      {renaming ? (
        <div style={{ padding: "4px var(--space-3)" }}>
          <input
            ref={inputRef}
            value={renameVal}
            onChange={e => setRenameVal(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={e => {
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") setRenaming(false);
            }}
            style={{
              width: "100%",
              background: "var(--bg-elevated)",
              border: "1px solid var(--accent-500)",
              borderRadius: 6,
              padding: "5px 8px",
              color: "var(--text-primary)",
              fontSize: 12,
              fontFamily: "inherit",
              outline: "none",
            }}
          />
        </div>
      ) : (
        <button
          onClick={() => onSelect(conv.id)}
          title={conv.title}
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            width: "100%",
            padding: "6px var(--space-3)",
            background: isActive ? "var(--bg-tertiary)" : "transparent",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            textAlign: "left",
            color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
            transition: "background .15s, color .15s",
          }}
          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg-hover)"; }}
          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
        >
          {/* Pin indicator */}
          {conv.pinned && (
            <span style={{ width:11, height:11, display:"flex", flexShrink:0, color:"#0F6E56", opacity:.8 }}>
              {getIcon("pinFilled")}
            </span>
          )}
          {/* Chat icon */}
          {!conv.pinned && (
            <span style={{ width:14, height:14, display:"flex", flexShrink:0, opacity:.45 }}>
              {getIcon("chat")}
            </span>
          )}
          {/* Title */}
          <span style={{
            fontSize: 12,
            fontWeight: isActive ? 500 : 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}>
            {conv.title || "New conversation"}
          </span>
          {/* ... menu button — only on hover/active */}
          {(hovered || isActive || menuOpen) && (
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 20,
                height: 20,
                background: "transparent",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                color: "var(--text-muted)",
                flexShrink: 0,
                padding: 0,
              }}
              onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}
              title="Options"
            >
              <span style={{ width:14, height:14, display:"flex" }}>{getIcon("dots")}</span>
            </button>
          )}
        </button>
      )}

      {menuOpen && (
        <ConvMenu
          conv={conv}
          onPin={onPin}
          onRename={() => setRenaming(true)}
          onDelete={onDelete}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Chat history section ──────────────────────────────────────────────────────
function ChatHistory({ collapsed, mobileOpen, currentConversationId, onSelectConversation, onNewChat, userId }) {
  const [conversations, setConversations] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    const { data } = await listConversations(userId);
    setConversations(data || []);
  }, [userId, currentConversationId]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  if (collapsed || !userId) return null;

  const pinned   = conversations.filter(c => c.pinned);
  const unpinned = conversations.filter(c => !c.pinned);
  const limit    = mobileOpen ? 5 : 10;
  const visibleUnpinned = unpinned.slice(0, Math.max(0, limit - pinned.length));

  const handlePin = async (conv) => {
    await togglePinConversation(conv.id, userId, !conv.pinned);
    loadHistory();
  };

  const handleRename = async (conv, newTitle) => {
    await renameConversation(conv.id, userId, newTitle);
    loadHistory();
  };

  const handleDelete = async (conv) => {
    if (!window.confirm(`Delete "${conv.title || "this conversation"}"?`)) return;
    await deleteConversation(conv.id, userId);
    loadHistory();
  };

  const renderConv = (conv) => (
    <ConvRow
      key={conv.id}
      conv={conv}
      isActive={conv.id === currentConversationId}
      onSelect={onSelectConversation}
      onPin={() => handlePin(conv)}
      onRename={(title) => handleRename(conv, title)}
      onDelete={() => handleDelete(conv)}
    />
  );

  return (
    <div style={{ borderTop:"1px solid var(--border-subtle)", marginTop:"var(--space-2)", paddingTop:"var(--space-3)" }}>
      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 var(--space-3)", marginBottom:"var(--space-1)" }}>
        <button
          onClick={() => mobileOpen && setHistoryOpen(v => !v)}
          type="button"
          style={{ display:"flex", alignItems:"center", gap:"var(--space-1)", background:"none", border:"none", padding:0, cursor: mobileOpen ? "pointer" : "default", color:"var(--text-muted)" }}
        >
          <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>Recent chats</span>
          {mobileOpen && (
            <span style={{ width:12, height:12, display:"flex", transition:"transform 150ms", transform: historyOpen ? "rotate(90deg)" : "rotate(0deg)", opacity:.4 }}>
              {getIcon("chevron")}
            </span>
          )}
        </button>
        <button
          onClick={onNewChat}
          title="New chat"
          type="button"
          style={{ display:"flex", alignItems:"center", justifyContent:"center", width:28, height:28, background:"rgba(15,110,86,0.08)", border:"1px solid rgba(15,110,86,0.28)", color:"#0F6E56", cursor:"pointer", borderRadius:"999px", flexShrink:0 }}
        >
          <span style={{ width:14, height:14, display:"flex" }}>{getIcon("plus")}</span>
        </button>
      </div>

      {(!mobileOpen || historyOpen) && (
        <div style={{ display:"flex", flexDirection:"column" }}>
          {/* Pinned section */}
          {pinned.length > 0 && (
            <>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#0F6E56", opacity:.7, padding:"4px var(--space-3) 2px" }}>
                Pinned
              </span>
              {pinned.map(renderConv)}
              {unpinned.length > 0 && (
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text-muted)", padding:"6px var(--space-3) 2px" }}>
                  Recent
                </span>
              )}
            </>
          )}

          {/* Unpinned conversations */}
          {conversations.length === 0 ? (
            <p style={{ fontSize:12, color:"var(--text-muted)", padding:"0 var(--space-3)", margin:"var(--space-1) 0 var(--space-2)" }}>
              No conversations yet.
            </p>
          ) : (
            visibleUnpinned.map(renderConv)
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Sidebar export ───────────────────────────────────────────────────────
export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose, user, plan, onSignOut }) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { conversationId, setConversationId, triggerNewChat } = useEDGEXContext();
  const [expandedSections, setExpandedSections] = useState({});

  const rawName    = user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const avatarLetter = rawName?.[0]?.toUpperCase() || "U";
  const planLabel  = PLAN_LABELS[plan] || "Free";

  const isActive       = (href) => router.pathname === href || router.asPath === href;
  const isParentActive = (section) => isActive(section.href) || section.children?.some(c => isActive(c.href));
  const toggleSection  = (id) => setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));

  const renderNavIcon = (section) => {
    if (section.id === "edgex") return <EDGEXNavIcon />;
    return <span className="sidebar__icon">{getIcon(section.icon)}</span>;
  };

  function handleSelectConversation(id) {
    setConversationId(id);
    if (mobileOpen) onMobileClose?.();
    router.push(`/copilot?conv=${id}`);
  }

  function handleNewChat() {
    triggerNewChat();
    if (mobileOpen) onMobileClose?.();
    router.push("/copilot");
  }

  const sidebarClass = ["sidebar", collapsed && "sidebar--collapsed", mobileOpen && "sidebar--open"].filter(Boolean).join(" ");

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? "sidebar-overlay--visible" : ""}`} onClick={onMobileClose} />
      <aside className={sidebarClass}>
        {/* Header */}
        <div className="sidebar__header">
          <Link href="/copilot" className="sidebar__logo">
            <HireEdgeLogo size={collapsed ? 24 : 28} interactive />
            {!collapsed && <span>HireEdge</span>}
          </Link>
          <button
            className="sidebar__toggle"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            type="button"
            style={collapsed ? { marginLeft:0 } : undefined}
          >
            <span className="sidebar__icon" style={collapsed ? { transform:"rotate(180deg)" } : undefined}>
              {getIcon("chevron")}
            </span>
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar__nav">
          {NAV_SECTIONS.map(section => (
            <div key={section.id} className="sidebar__section">
              <Link
                href={section.href}
                className={["sidebar__link", section.primary && "sidebar__link--primary", isParentActive(section) && !section.primary && "sidebar__link--active"].filter(Boolean).join(" ")}
                title={collapsed ? section.label : undefined}
              >
                {renderNavIcon(section)}
                {!collapsed && <span>{section.label}</span>}
                {!collapsed && section.badge && <span className="sidebar__badge">{section.badge}</span>}
                {!collapsed && section.children && (
                  <button
                    className="sidebar__toggle"
                    type="button"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); toggleSection(section.id); }}
                    style={{ transform: expandedSections[section.id] ? "rotate(90deg)" : "rotate(0deg)", transition:"transform 150ms" }}
                  >
                    <span className="sidebar__icon">{getIcon("chevron")}</span>
                  </button>
                )}
              </Link>
              {!collapsed && section.children && (isParentActive(section) || expandedSections[section.id]) && (
                <div className="sidebar__children">
                  {section.children.map(child => (
                    <Link
                      key={child.id}
                      href={child.href}
                      className={["sidebar__child-link", isActive(child.href) && "sidebar__child-link--active"].filter(Boolean).join(" ")}
                    >
                      <span>{child.label}</span>
                      {child.plan === "pro" && <span className="sidebar__badge">PRO</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {!collapsed && <div style={{ borderTop:"1px solid var(--border-subtle)", margin:"var(--space-3) 0" }} />}

          {ACCOUNT_NAV.map(item => (
            <Link
              key={item.id}
              href={item.href}
              className={["sidebar__link", isActive(item.href) && "sidebar__link--active"].filter(Boolean).join(" ")}
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar__icon">{getIcon(item.icon)}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}

          {/* Recent Chats with pin/delete/rename */}
          <ChatHistory
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            currentConversationId={conversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            userId={authUser?.id}
          />
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="sidebar__footer">
            <div className="sidebar__user">
              <div className="sidebar__avatar">{avatarLetter}</div>
              <div className="sidebar__user-info">
                <div className="sidebar__user-name">{rawName}</div>
                <div className="sidebar__user-plan">{planLabel} plan</div>
              </div>
            </div>
            <button
              onClick={() => onSignOut?.()}
              title="Log out"
              type="button"
              className="sidebar__link"
              style={{ width:"100%", marginTop:"var(--space-1)", opacity:.6, fontSize:"var(--text-xs)" }}
            >
              <span className="sidebar__icon">{getIcon("logout")}</span>
              <span>Log out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
