// ============================================================================
// components/copilot/EDGEXShell.js
// EDGEX shell — fixed layout
// ============================================================================

import { useEDGEXContext } from "../../context/CopilotContext";
import EDGEXIcon from "../brand/EDGEXIcon";
import ChatWindow from "./ChatWindow";

export default function EDGEXShell() {
  const { triggerNewChat } = useEDGEXContext();

  return (
    <div className="exs-shell">
      <header className="exs-header">
        <div className="exs-header__brand">
          <EDGEXIcon size={17} state="header" color="#0F6E56" />
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
