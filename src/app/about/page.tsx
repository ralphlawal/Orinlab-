import Link from "next/link";
import { ArrowRight, Heart, Globe, Target, Lightbulb, Users, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "About – Orinlabi",
  description:
    "Learn about Orinlabi's story, mission, and vision to build the leading African-owned music distribution platform.",
};

function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#007bff]/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
          Our Story
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
          Built For African Artists.
        </h1>
        <p className="text-white/60 text-lg sm:text-xl leading-relaxed">
          Orinlabi is more than a music distributor. It is a complete artist
          growth ecosystem designed to empower independent African creators to
          release globally, earn fairly, and own their legacy.
        </p>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 aspect-square flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-[#007bff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-[#007bff] font-bold text-4xl">O</span>
            </div>
            <p className="text-white/30 text-sm uppercase tracking-widest">
              Orinlabi
            </p>
            <p className="text-white/20 text-xs mt-2">
              A Ralph Lawal Group Company
            </p>
          </div>
        </div>

        <div>
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
            The Company
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Our Story
          </h2>
          <div className="space-y-5 text-white/60 leading-relaxed">
            <p>
              Orinlabi was founded by Ralph Lawal with a clear vision: to build
              the infrastructure that African artists deserve — one that values
              their art, protects their ownership, and amplifies their voice to
              the world.
            </p>
            <p>
              The African music industry is one of the fastest-growing in the
              world. Yet independent artists across the continent have long faced
              barriers to global distribution — complex systems, opaque royalty
              structures, and platforms not built with their needs in mind.
            </p>
            <p>
              Orinlabi changes that. Starting with Ditto Music's distribution
              infrastructure and a full suite of artist services, we are
              building the platform that will power the next generation of
              African musical talent.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderMessage() {
  return (
    <section className="py-20 px-4 bg-white/[0.02]">
      <div className="max-w-3xl mx-auto">
        <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4 text-center">
          A Message From The Founder
        </p>
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-3xl p-10">
          <div className="text-white/70 text-lg leading-relaxed space-y-5 italic">
            <p>
              &ldquo;I built Orinlabi because I believe African music is a global
              force that deserves global infrastructure. Too many talented
              artists are releasing music without the tools, support, or
              knowledge to build a sustainable career from it.
            </p>
            <p>
              Orinlabi is my answer to that problem. It is a platform where
              artists can distribute their music worldwide, receive real
              marketing support, and grow their careers — while keeping every
              right to the music they create.
            </p>
            <p>
              This is just the beginning. We are building something that will
              define how African music reaches the world for generations to
              come.&rdquo;
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-white font-bold text-lg">Ralph Lawal</p>
            <p className="text-white/40 text-sm mt-1">
              Founder & CEO, Orinlabi · Ralph Lawal Group
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function VisionMission() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="bg-[#007bff]/5 border border-[#007bff]/20 rounded-3xl p-10">
          <div className="w-12 h-12 bg-[#007bff]/20 rounded-xl flex items-center justify-center text-[#007bff] mb-6">
            <Globe size={24} />
          </div>
          <h3 className="text-white font-bold text-2xl mb-4">Our Vision</h3>
          <p className="text-white/60 leading-relaxed">
            To become the world&apos;s leading African-owned music distribution and
            artist services platform — the infrastructure that powers African
            music globally and builds generational wealth for African creators.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10">
          <div className="w-12 h-12 bg-[#007bff]/10 rounded-xl flex items-center justify-center text-[#007bff] mb-6">
            <Target size={24} />
          </div>
          <h3 className="text-white font-bold text-2xl mb-4">Our Mission</h3>
          <p className="text-white/60 leading-relaxed">
            To help independent African artists release music globally while
            maintaining full ownership of their work — providing distribution,
            marketing, development, and royalty management under one roof.
          </p>
        </div>
      </div>
    </section>
  );
}

function Values() {
  const values = [
    {
      icon: <Heart size={20} />,
      title: "Artist First",
      desc: "Every decision we make starts with what is best for the artist. Your success is our success.",
    },
    {
      icon: <ShieldCheck size={20} />,
      title: "Ownership",
      desc: "We believe artists should own their masters. We never take your rights.",
    },
    {
      icon: <Globe size={20} />,
      title: "Global Ambition",
      desc: "We think globally while understanding the African context deeply.",
    },
    {
      icon: <Users size={20} />,
      title: "Community",
      desc: "We build a community of artists who support and inspire each other.",
    },
    {
      icon: <Lightbulb size={20} />,
      title: "Innovation",
      desc: "We use technology to democratize access to music industry tools.",
    },
    {
      icon: <Target size={20} />,
      title: "Transparency",
      desc: "Clear royalty reporting. No hidden fees. No surprises.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-3">
            What We Stand For
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Our Core Values.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7"
            >
              <div className="w-10 h-10 bg-[#007bff]/10 rounded-lg flex items-center justify-center text-[#007bff] mb-5">
                {v.icon}
              </div>
              <h4 className="text-white font-semibold text-lg mb-2">
                {v.title}
              </h4>
              <p className="text-white/50 text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Roadmap() {
  const phases = [
    { phase: "Phase 1", title: "Launch", desc: "Launch website and onboard artists. Begin distribution operations.", status: "current" },
    { phase: "Phase 2", title: "Dashboard", desc: "Artist dashboard with release tracking, royalty visibility, and reports.", status: "upcoming" },
    { phase: "Phase 3", title: "Royalty Portal", desc: "Full royalty portal with payment processing and detailed analytics.", status: "upcoming" },
    { phase: "Phase 4", title: "Publishing", desc: "Publishing services and sync licensing for African creators.", status: "upcoming" },
    { phase: "Phase 5", title: "Full Platform", desc: "Complete independent distribution infrastructure owned by Orinlabi.", status: "upcoming" },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-3">
            The Roadmap
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Where We Are Going.
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />
          <div className="space-y-8">
            {phases.map((p) => (
              <div key={p.phase} className="relative flex gap-8 pl-16">
                <div
                  className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    p.status === "current"
                      ? "bg-[#007bff] border-[#007bff] text-white"
                      : "bg-black border-white/20 text-white/30"
                  }`}
                >
                  {p.phase.replace("Phase ", "")}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-semibold">{p.title}</h4>
                    {p.status === "current" && (
                      <span className="text-[#007bff] text-xs font-medium bg-[#007bff]/10 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-sm">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Join the Movement.
        </h2>
        <p className="text-white/50 text-lg mb-10">
          Be part of the platform that is rewriting the rules for African
          artists worldwide.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/submit"
            className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-8 py-4 rounded-full transition-all duration-200"
          >
            Start Distributing
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2 text-white/60 hover:text-white font-medium transition-colors"
          >
            Get In Touch <ArrowRight size={16} />
          </Link>
        </div>
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
      <Values />
      <Roadmap />
      <CTA />
    </>
  );
}
