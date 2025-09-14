import ContinueOverlay from "./ContinueOverlay";

export default function OverlayRoot({
  overlayOpen,
  proceed,
  text,
}: {
  overlayOpen: boolean;
  proceed: () => void;
  text?: string;
}) {
  return <ContinueOverlay open={overlayOpen} text={text} onContinue={proceed} />;
}

