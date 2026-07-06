import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md">
        <Link href="/" className="inline-flex justify-center">
          <Image
            src="https://res.cloudinary.com/dco9drzzp/image/upload/v1783353777/94573a59-02c9-4066-b6ab-5ce4ce3c1c54_inmopu.png"
            alt="OrinlabÍ Records"
            width={110}
            height={30}
            className="object-contain"
          />
        </Link>

        <div>
          <p className="text-[#007bff] text-8xl font-black leading-none">404</p>
          <h1 className="text-white font-bold text-2xl mt-4">Page not found</h1>
          <p className="text-white/50 mt-3 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-7 py-3 rounded-full transition-colors text-sm"
          >
            Go Home
          </Link>
          <Link
            href="/submit"
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            Apply for Distribution
          </Link>
        </div>
      </div>
    </div>
  );
}
