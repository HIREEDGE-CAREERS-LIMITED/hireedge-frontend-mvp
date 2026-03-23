// ============================================================================
// components/brand/EDGEXBadge.js
//
// "Powered by EDGEX" label for tool outputs.
// Usage:
//   <EDGEXBadge />               -- default subtle inline label
//   <EDGEXBadge size="large" />  -- larger version for report headers
// ============================================================================

import EDGEXIcon from "./EDGEXIcon";

export default function EDGEXBadge({ size = "small" }) {
  if (size === "large") {
    return (
      <div className="edgex-badge edgex-badge--large">
        <EDGEXIcon size={18} state="idle" color="#0F6E56" />
        <span className="edgex-badge__text">EDGEX Career Intelligence Report</span>
      </div>
    );
  }
  return (
    <div className="edgex-badge edgex-badge--small">
      <EDGEXIcon size={10} state="idle" color="#0F6E56" />
      <span className="edgex-badge__text">Powered by EDGEX</span>
    </div>
  );
}
