import Link from "next/link";
import { Globe, ArrowRight, Music } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export const metadata = {
  title: "Labels – Orinlabí",
  description: "Record labels distributed globally by Orinlabí.",
};

function slugify(name: string) {
  return encodeURIComponent(name.trim());
}

async function getLabels() {
  const { data: labels } = await supabase
    .from("label_profiles")
    .select("id,name,slug,logo_url,bio,country,genre_focus,founded_year,is_featured")
    .order("is_featured", { ascending: false })
    .order("name");

  if (!labels?.length) return [];

  // Count artists per label via record_label text match
  const { data: profiles } = await supabase
    .from("artist_profiles")
    .select("record_label")
    .not("record_label", "is", null);

  const countMap: Record<string, number> = {};
  if (profiles) {
    for (const p of profiles) {
      if (p.record_label) {
        const key = p.record_label.toLowerCase().trim();
        countMap[key] = (countMap[key] ?? 0) + 1;
      }
    }
  }

  return labels.map((l) => ({
    ...l,
    artistCount: countMap[l.name.toLowerCase().trim()] ?? 0,
  }));
}

export default async function LabelsPage() {
  const labels = await getLabels();

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#007bff]/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
            Label Partners
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
            Record Labels
          </h1>
          <p className="text-white/60 text-lg sm:text-xl leading-relaxed">
            Independent labels trusting Orinlabí to distribute their artists to the world.
          </p>
        </div>
      </section>

      {/* Stats */}
      {labels.length > 0 && (
        <section className="py-16 px-4 border-y border-white/10">
          <div className="max-w-3xl mx-auto grid grid-cols-2 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">{labels.length}</div>
              <div className="text-white/40 text-sm uppercase tracking-wider">Labels</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">
                {labels.reduce((s, l) => s + l.artistCount, 0)}
              </div>
              <div className="text-white/40 text-sm uppercase tracking-wider">Artists Represented</div>
            </div>
          </div>
        </section>
      )}

      {/* Label grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {labels.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-[#007bff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music size={36} className="text-[#007bff]/50" />
              </div>
              <h3 className="text-white font-bold text-2xl mb-3">Labels Coming Soon</h3>
              <p className="text-white/40 max-w-sm mx-auto leading-relaxed">
                We&apos;re onboarding our first label partners. Check back soon.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-block bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-8 py-3.5 rounded-full transition-colors"
              >
                Get In Touch
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {labels.map((l) => (
                <Link
                  key={l.slug}
                  href={`/labels/${slugify(l.slug)}`}
                  className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#007bff]/30 rounded-3xl overflow-hidden transition-all duration-300 block"
                >
                  {/* Logo area */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-[#007bff]/20 via-[#007bff]/5 to-black overflow-hidden flex items-center justify-center">
                    {l.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.logo_url}
                        alt={l.name}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Music size={48} className="text-[#007bff]/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      {l.genre_focus && (
                        <span className="text-[#007bff] text-xs font-semibold bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#007bff]/20">
                          {l.genre_focus}
                        </span>
                      )}
                      {l.country && (
                        <div className="flex items-center gap-1.5 text-white/70 text-xs bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                          <Globe size={11} />
                          {l.country}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-white font-bold text-xl">{l.name}</h3>
                      {l.is_featured && (
                        <span className="flex-shrink-0 bg-[#007bff]/10 border border-[#007bff]/20 text-[#007bff] text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>

                    {l.bio ? (
                      <p className="text-white/50 text-sm leading-relaxed mb-5 line-clamp-3">
                        {l.bio}
                      </p>
                    ) : (
                      <p className="text-white/25 text-sm italic mb-5">Label bio coming soon.</p>
                    )}

                    <div className="flex items-center justify-between">
                      {l.artistCount > 0 ? (
                        <span className="text-white/40 text-xs">
                          {l.artistCount} artist{l.artistCount !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span />
                      )}
                      {l.founded_year ? (
                        <span className="text-white/25 text-xs">Est. {l.founded_year}</span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white/[0.02] border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Distribute Your Label&apos;s Roster
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Orinlabí offers label-level distribution services — get all your artists on 150+ platforms worldwide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-8 py-4 rounded-full transition-all duration-200"
            >
              Partner With Us
            </Link>
            <Link
              href="/services"
              className="flex items-center gap-2 text-white/60 hover:text-white font-medium transition-colors"
            >
              Our Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
