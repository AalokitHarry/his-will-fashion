import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "917999929550";
const DEFAULT_MESSAGE = "Hi His Will Fashion! I have a question about";

export function waLink(message = DEFAULT_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Floating contact button — sitewide, like the cart. Uses WhatsApp's own
// green for instant recognizability (a generic chat icon, not their logo,
// to avoid reproducing a trademarked mark — same approach already used for
// the Instagram camera icon elsewhere on this site).
export default function WhatsAppButton() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-105"
      style={{ backgroundColor: "#25D366" }}
    >
      <MessageCircle size={26} className="text-white" strokeWidth={2} />
    </a>
  );
}
