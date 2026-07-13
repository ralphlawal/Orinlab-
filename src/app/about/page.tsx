import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Globe, Target, Lightbulb, Users, ShieldCheck, Zap } from "lucide-react";
import { AnimateIn } from "@/components/AnimateIn";

export const metadata = {
  title: "About – OrinlabÍ Records",
  description:
    "The story, mission, and vision behind OrinlabÍ Records — the home of independent artists worldwide.",
};

function Hero() {
  return (
    <section className="relative pt-36 pb-24 px-6 text-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#007bff]/7 rounded-full blur-[140px] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <AnimateIn>
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] text-white/60 text-[11px] font-semibold px-4 py-2 rounded-full mb-10">
            <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
            Our Story
          </div>
        </AnimateIn>
        <AnimateIn delay={80}>
          <h1 className="text-[clamp(3rem,8vw,6rem)] font-bold text-white leading-[0.95] tracking-tight mb-6">
            Built for<br /><span className="text-[#007bff]">independent</span><br />artists.
          </h1>
        </AnimateIn>
        <AnimateIn delay={160}>
          <p className="text-white/50 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
            OrinlabÍ Records is a global music distribution platform for independent creators everywhere. We help artists release worldwide, earn fairly, and own their legacy — with a team personally invested in every artist we work with.
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <AnimateIn direction="left">
          <div className="relative rounded-3xl overflow-hidden aspect-square" style={{ background: "linear-gradient(135deg, #050814 0%, #0d0a1f 40%, #0a0510 100%)" }}>
            {/* Ambient blobs */}
            <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-[#007bff]/20 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-violet-600/15 rounded-full blur-[50px] pointer-events-none" />
            <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-pink-500/10 rounded-full blur-[45px] pointer-events-none" />
            <div className="absolute inset-0 border border-white/[0.06] rounded-3xl" />
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-10">
              <Image
                src="https://res.cloudinary.com/dco9drzzp/image/upload/v1783353777/94573a59-02c9-4066-b6ab-5ce4ce3c1c54_inmopu.png"
                alt="OrinlabÍ Records"
                width={160}
                height={44}
                className="object-contain"
              />
              <div className="grid grid-cols-2 gap-4 w-full">
                {[
                  { v: "150+", l: "Platforms" },
                  { v: "100%", l: "Ownership" },
                  { v: "$0",   l: "To Start" },
                  { v: "48h",  l: "Go-Live" },
                ].map((s) => (
                  <div key={s.l} className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4 text-center">
                    <p className="text-white font-bold text-xl leading-none mb-1">{s.v}</p>
                    <p className="text-white/35 text-[10px] font-semibold uppercase tracking-wider">{s.l}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/20 text-[11px] tracking-wider text-center">A Ralph Lawal Group Company</p>
            </div>
          </div>
        </AnimateIn>

        <div>
          <AnimateIn>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
              <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">The Company</span>
            </div>
          </AnimateIn>
          <AnimateIn delay={80}>
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white leading-[1.05] tracking-tight mb-6">
              Our Story
            </h2>
          </AnimateIn>
          <div className="space-y-5 text-white/55 leading-relaxed">
            {[
              "OrinlabÍ Records was founded by Ralph Lawal with a clear vision: to build the infrastructure that independent artists deserve — one that values their art, protects their ownership, and amplifies their voice to the world.",
              "Independent artists have long faced barriers to global distribution — complex systems, opaque royalty structures, and platforms not built with their needs in mind.",
              "OrinlabÍ Records changes that. With our global distribution network and a full suite of artist services, we are building the platform that will power the next generation of musical talent worldwide.",
            ].map((text, i) => (
              <AnimateIn key={i} delay={140 + i * 80}>
                <p>{text}</p>
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderMessage() {
  return (
    <section className="py-24 px-6 border-y border-white/[0.05] bg-white/[0.01]">
      <div className="max-w-3xl mx-auto">
        <AnimateIn>
          <div className="flex items-center justify-center gap-2 mb-10">
            <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
            <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">A Message From The Founder</span>
          </div>
        </AnimateIn>
        <AnimateIn delay={80}>
          <div className="bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 rounded-3xl p-10 sm:p-14">
            <div className="text-white/65 text-lg leading-relaxed space-y-5 italic mb-10">
              <p>
                &ldquo;I built OrinlabÍ Records because I believe independent music deserves global infrastructure. Too many talented artists are releasing music without the tools, support, or knowledge to build a sustainable career from it.
              </p>
              <p>
                OrinlabÍ Records is my answer to that problem. It is a platform where artists can distribute their music worldwide, receive real marketing support, and grow their careers — while keeping every right to the music they create.
              </p>
              <p>
                This is just the beginning. We are building something that will define how music reaches the world for generations to come.&rdquo;
              </p>
            </div>
            <div className="pt-8 border-t border-white/10">
              <p className="text-white font-bold text-lg">Ralph Lawal</p>
              <p className="text-white/40 text-sm mt-1">Founder &amp; CEO, OrinlabÍ Records · Ralph Lawal Group</p>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

function VisionMission() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        <AnimateIn direction="left">
          <div className="bg-[#007bff]/5 border border-[#007bff]/20 hover:border-[#007bff]/40 transition-all duration-300 rounded-3xl p-10 h-full">
            <div className="w-12 h-12 bg-[#007bff]/20 rounded-xl flex items-center justify-center text-[#007bff] mb-6">
              <Globe size={24} />
            </div>
            <h3 className="text-white font-bold text-2xl mb-4">Our Vision</h3>
            <p className="text-white/55 leading-relaxed">
              To become the world&apos;s leading independent music distribution and artist services platform — the infrastructure that powers music globally and builds generational wealth for independent creators everywhere.
            </p>
          </div>
        </AnimateIn>

        <AnimateIn direction="right">
          <div className="bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 rounded-3xl p-10 h-full">
            <div className="w-12 h-12 bg-[#007bff]/10 rounded-xl flex items-center justify-center text-[#007bff] mb-6">
              <Target size={24} />
            </div>
            <h3 className="text-white font-bold text-2xl mb-4">Our Mission</h3>
            <p className="text-white/55 leading-relaxed">
              To help independent artists release music globally while maintaining full ownership of their work — providing distribution, marketing, development, and royalty management under one roof.
            </p>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

function Standards() {
  const criteria = [
    {
      number: "01",
      title: "Sound Quality",
      desc: "We care about your sound, not your budget. Every genre and production style is welcome — we review with open ears and look for music that is crafted with intention.",
    },
    {
      number: "02",
      title: "Artistic Vision",
      desc: "We love working with artists who have a clear sense of who they are. Whether you are just starting out or already established, a clear direction helps us support you better.",
    },
    {
      number: "03",
      title: "Originality",
      desc: "Music is diverse. We celebrate every sub-genre, language, and regional sound — from Afrobeats to indie rock, electronic to classical and everything in between.",
    },
  ];

  return (
    <section id="standards" className="py-24 px-6 border-y border-white/[0.05] bg-white/[0.01]">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-16">
          <AnimateIn>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
              <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">How We Work</span>
            </div>
          </AnimateIn>
          <AnimateIn delay={80}>
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white leading-[1.05] tracking-tight mb-6">
              What We Look For.
            </h2>
          </AnimateIn>
          <AnimateIn delay={140}>
            <p className="text-white/45 leading-relaxed">
              Our team personally reviews every application. We are not driven by follower counts or streaming numbers — we listen to your music and assess it on its own merit.
            </p>
          </AnimateIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {criteria.map((c, i) => (
            <AnimateIn key={c.number} delay={i * 80}>
              <div className="bg-white/[0.03] border border-white/[0.06] hover:border-[#007bff]/30 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 h-full">
                <p className="text-[#007bff]/40 text-5xl font-bold mb-6 leading-none">{c.number}</p>
                <h4 className="text-white font-bold text-xl mb-3">{c.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed">{c.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>

        <AnimateIn delay={200}>
          <div className="mt-10 bg-[#007bff]/5 border border-[#007bff]/15 rounded-2xl p-8 max-w-2xl">
            <p className="text-white/65 text-sm leading-relaxed">
              <span className="text-white font-semibold">Our team responds within 3–5 business days.</span>{" "}
              We provide feedback with every review and our door is always open. Many of our artists applied multiple times as their music evolved — we welcome that.
            </p>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

function Values() {
  const values = [
    { icon: <Heart size={20} />,       title: "Artist First",    desc: "Every decision we make starts with what is best for the artist. Your success is our success." },
    { icon: <ShieldCheck size={20} />, title: "Ownership",       desc: "We believe artists should own their masters. We never take your rights." },
    { icon: <Globe size={20} />,       title: "Global Reach",    desc: "We think globally and build infrastructure that works for creators everywhere." },
    { icon: <Users size={20} />,       title: "Community",       desc: "We build a community of artists who support and inspire each other." },
    { icon: <Lightbulb size={20} />,   title: "Innovation",      desc: "We use technology to democratize access to music industry tools." },
    { icon: <Target size={20} />,      title: "Transparency",    desc: "Clear royalty reporting. No hidden fees. No surprises." },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <AnimateIn>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
              <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">What We Stand For</span>
            </div>
          </AnimateIn>
          <AnimateIn delay={80}>
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white leading-[1.05] tracking-tight">
              Our Core Values.
            </h2>
          </AnimateIn>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v, i) => (
            <AnimateIn key={v.title} delay={i * 60}>
              <div className="bg-white/[0.03] border border-white/[0.06] hover:border-[#007bff]/20 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-0.5 h-full">
                <div className="w-10 h-10 bg-[#007bff]/10 rounded-lg flex items-center justify-center text-[#007bff] mb-5">
                  {v.icon}
                </div>
                <h4 className="text-white font-semibold text-base mb-2">{v.title}</h4>
                <p className="text-white/45 text-sm leading-relaxed">{v.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Roadmap() {
  const phases = [
    { phase: "Phase 1", title: "Launch",        desc: "Launch website and onboard artists. Begin distribution operations.",                               status: "current" },
    { phase: "Phase 2", title: "Dashboard",     desc: "Artist dashboard with release tracking, royalty visibility, and detailed reports.",                status: "upcoming" },
    { phase: "Phase 3", title: "Royalty Portal",desc: "Full royalty portal with payment processing and analytics.",                                       status: "upcoming" },
    { phase: "Phase 4", title: "Publishing",    desc: "Publishing services and sync licensing for creators worldwide.",                                   status: "upcoming" },
    { phase: "Phase 5", title: "Full Platform", desc: "Complete independent distribution infrastructure owned and operated by OrinlabÍ Records.",                 status: "upcoming" },
  ];

  return (
    <section className="py-24 px-6 border-t border-white/[0.05] bg-white/[0.01]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <AnimateIn>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
              <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">The Roadmap</span>
            </div>
          </AnimateIn>
          <AnimateIn delay={80}>
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white leading-[1.05] tracking-tight">
              Where We Are Going.
            </h2>
          </AnimateIn>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-white/[0.07]" />
          <div className="space-y-8">
            {phases.map((p, i) => (
              <AnimateIn key={p.phase} delay={i * 70} direction="left">
                <div className="relative flex gap-8 pl-16">
                  <div
                    className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                      p.status === "current"
                        ? "bg-[#007bff] border-[#007bff] text-white shadow-[0_0_20px_rgba(0,123,255,0.4)]"
                        : "bg-black border-white/[0.12] text-white/30"
                    }`}
                  >
                    {p.phase.replace("Phase ", "")}
                  </div>
                  <div className="pb-4 pt-1.5">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h4 className="text-white font-semibold">{p.title}</h4>
                      {p.status === "current" && (
                        <span className="text-[#007bff] text-[10px] font-bold bg-[#007bff]/10 border border-[#007bff]/20 px-2.5 py-0.5 rounded-full uppercase tracking-widest">Active</span>
                      )}
                    </div>
                    <p className="text-white/40 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <AnimateIn>
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
            <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">Ready to release?</span>
          </div>
        </AnimateIn>
        <AnimateIn delay={80}>
          <h2 className="text-[clamp(3rem,7vw,5.5rem)] font-bold text-white leading-[0.95] tracking-tight mb-5">
            Join the<br /><span className="text-[#007bff]">movement.</span>
          </h2>
        </AnimateIn>
        <AnimateIn delay={140}>
          <p className="text-white/45 text-lg mb-10">
            Be part of the platform rewriting the rules for independent artists worldwide.
          </p>
        </AnimateIn>
        <AnimateIn delay={200}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold px-9 py-4 rounded-full transition-all duration-200 hover:shadow-[0_0_40px_rgba(0,123,255,0.4)] hover:gap-3 group"
            >
              Try For Free <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white font-medium px-7 py-4 rounded-full border border-white/10 hover:border-white/30 transition-all duration-200"
            >
              Get In Touch <ArrowRight size={14} />
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <Hero />
      <Story />
      <FounderMessage />
      <VisionMission />
      <Standards />
      <Values />
      <Roadmap />
      <CTA />
    </>
  );
}
