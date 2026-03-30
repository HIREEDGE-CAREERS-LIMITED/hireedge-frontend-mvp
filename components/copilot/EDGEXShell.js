// ============================================================================
// components/copilot/EDGEXShell.js
// EDGEX shell — fixed layout
// ============================================================================
import { useRouter } from "next/router";
import { useEDGEXContext } from "../../context/CopilotContext";
import EDGEXIcon from "../brand/EDGEXIcon";
import ChatWindow from "./ChatWindow";

export default function EDGEXShell() {
  const router = useRouter();
  const { triggerNewChat } = useEDGEXContext();

  const handleBack = () => {
    // Go to dashboard if history is empty, otherwise go back
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="exs-shell">
      <header className="exs-header">
        <div className="exs-header__brand">
          {/* Back button — mobile only via CSS, gives users a navigation escape */}
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

          {/* Logo with glow wrapper */}
          <div className="exs-header__icon-wrap">
            <EDGEXIcon size={15} state="header" color="#0F6E56" />
          </div>

          <span className="exs-header__name">EDGEX</span>
          <span className="exs-header__sep" />
          <span className="exs-header__sub">Career Intelligence</span>
        </div>
        <button
          className="exs-header__new"
          onClick={triggerNewChat}
          type="button"
        >
          New chat
        </button>
      </header>
      <main className="exs-body">
        <div className="exs-chat-stage">
          <ChatWindow />
        </div>
      </main>
    </div>
  );
}
