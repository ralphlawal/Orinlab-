import { Loader2 } from "lucide-react";

// Shown while the presave page fetches — no label branding visible to fans
export default function PresaveLoading() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <Loader2 size={24} className="text-white/30 animate-spin" />
    </div>
  );
}
