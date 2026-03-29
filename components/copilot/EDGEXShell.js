// ============================================================================
// components/copilot/EDGEXShell.js
//
// Simplified layout — no sidebar. Full-width chat.
// Single header with New chat button.
// ============================================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useEDGEXContext } from "../../context/CopilotContext";
import EDGEXIcon from "../brand/EDGEXIcon";
import ChatWindow from "./ChatWindow";

export default function EDGEXShell() {
  const { triggerNewChat } = useEDGEXContext();

  return (
    <div className="exs-shell">

      {/* Single unified header */}
      <header className="exs-header">
        <div className="exs-header__brand">
          <EDGEXIcon size={17} state="header" color="#0F6E56" />
          <span className="exs-header__name">EDGEX</span>
          <span className="exs-header__sep" />
          <span className="exs-header__sub">Career Intelligence</span>
        </div>
        <button className="exs-header__new" onClick={triggerNewChat}>
          New chat
        </button>
      </header>

      {/* Full-width chat */}
      <div className="exs-body">
        <ChatWindow />
      </div>

    </div>
  );
}
