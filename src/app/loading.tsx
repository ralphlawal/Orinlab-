import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-40 bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <Image
          src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
          alt="Orinlabí"
          width={150}
          height={40}
          className="object-contain"
          priority
        />
        <Loader2 size={20} className="text-[#007bff] animate-spin" />
      </div>
    </div>
  );
}
