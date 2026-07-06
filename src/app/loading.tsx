import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[55] bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <Image
          src="https://res.cloudinary.com/dco9drzzp/image/upload/v1783353777/94573a59-02c9-4066-b6ab-5ce4ce3c1c54_inmopu.png"
          alt="OrinlabÍ Records"
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
