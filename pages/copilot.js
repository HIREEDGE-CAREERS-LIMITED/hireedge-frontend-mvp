// ============================================================================
// pages/copilot.js
// HireEdge Frontend — Copilot (primary experience)
// Renders the full Copilot chat UI using CopilotProvider + ChatWindow.
// ============================================================================

import { CopilotProvider } from "../context/CopilotContext";
import ChatWindow from "../components/copilot/ChatWindow";

export default function CopilotPage() {
  return (
    <CopilotProvider>
      <ChatWindow />
    </CopilotProvider>
  );
}
