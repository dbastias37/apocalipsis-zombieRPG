import { useAdvanceControls } from "../../hooks/useAdvanceControls";

export default function OverlayRoot({ overlayOpen, proceed }: { overlayOpen: boolean; proceed: () => void }) {
  useAdvanceControls(proceed, { enabled: overlayOpen, mobileOnly: true });
  return null;
}
