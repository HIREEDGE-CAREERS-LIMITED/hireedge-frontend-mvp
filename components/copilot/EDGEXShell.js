// ============================================================================
// components/copilot/EDGEXShell.js
//
// Clean EDGEX shell
// - Single premium header
// - New chat button wired to shared context
// - Full-height body so chat scroll works properly
// ============================================================================

import { useCallback } from "react";
import { useRouter } from "next/router";
import { useEDGEXContext } from "../../context/CopilotContext";
import EDGEXIcon from "../brand/EDGEXIcon";
import ChatWindow from "./ChatWindow";

export default function EDGEXShell() {
  const router = useRouter();
  const { triggerNewChat } = useEDGEXContext();

  const handleNewChat = useCallback(() => {
    triggerNewChat();
  }, [triggerNewChat]);

  const isEdgexRoute = router.pathname === "/edgex";
  const subLabel = isEdgexRoute ? "Career Intelligence" : "Career Intelligence";

  return (
    <div className="exs-shell">
      <header className="exs-header">
        <div className="exs-header__brand">
          <EDGEXIcon size={17} state="header" color="#0F6E56" />
          <span className="exs-header__name">EDGEX</span>
          <span className="exs-header__sep" />
          <span className="exs-header__sub">{subLabel}</span>
        </div>

        <div className="exs-header__actions">
          <button className="exs-header__new" onClick={handleNewChat} type="button">
            New chat
          </button>
        </div>
      </header>

      <div className="exs-body">
        <ChatWindow />
      </div>
    </div>
  );
}
