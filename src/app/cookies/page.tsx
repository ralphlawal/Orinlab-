export const metadata = {
  title: "Cookie Policy",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-white font-semibold text-xl">{title}</h2>
      <div className="text-white/60 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function CookieTable({ rows }: { rows: { name: string; type: string; purpose: string; expires: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08] mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.03]">
            <th className="text-left text-white/40 font-semibold px-4 py-3 text-xs uppercase tracking-widest">Cookie</th>
            <th className="text-left text-white/40 font-semibold px-4 py-3 text-xs uppercase tracking-widest">Type</th>
            <th className="text-left text-white/40 font-semibold px-4 py-3 text-xs uppercase tracking-widest">Purpose</th>
            <th className="text-left text-white/40 font-semibold px-4 py-3 text-xs uppercase tracking-widest">Expires</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-white/[0.05] last:border-0">
              <td className="px-4 py-3 text-white/80 font-mono text-xs">{r.name}</td>
              <td className="px-4 py-3 text-white/50">{r.type}</td>
              <td className="px-4 py-3 text-white/50">{r.purpose}</td>
              <td className="px-4 py-3 text-white/40 whitespace-nowrap">{r.expires}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiesPage() {
  return (
    <section className="pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-3">Cookie Policy</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: July 2026</p>

        <div className="space-y-10">
          <Section title="1. What Are Cookies">
            <p>
              Cookies are small text files placed on your device when you visit a website. They help
              the site remember your preferences, keep you logged in, and understand how you use the
              platform so we can improve it.
            </p>
            <p>
              OrinlabÍ Records uses cookies on{" "}
              <a href="https://orinlabi.com" className="text-[#007bff] hover:underline">orinlabi.com</a>{" "}
              to run the artist portal, secure your session, and measure traffic. We do not use cookies
              to track you across the internet or sell your data to advertisers.
            </p>
          </Section>

          <Section title="2. Types of Cookies We Use">
            <p>
              We use three categories of cookies: strictly necessary, functional, and analytics.
            </p>

            <p className="text-white/80 font-semibold mt-4">Strictly Necessary</p>
            <p>
              These cookies are required for the platform to work. You cannot opt out of them — without
              them, features like logging into your artist portal will not function.
            </p>
            <CookieTable rows={[
              { name: "sb-*", type: "Authentication", purpose: "Supabase session token — keeps you logged in to the artist portal", expires: "Session / 1 week" },
              { name: "orinlabi_cookie_consent", type: "Functional", purpose: "Remembers whether you have accepted this cookie notice", expires: "1 year" },
            ]} />

            <p className="text-white/80 font-semibold mt-6">Functional</p>
            <p>
              These cookies remember your preferences and improve your experience on the platform.
            </p>
            <CookieTable rows={[
              { name: "orinlabi_release_draft", type: "Functional", purpose: "Stores your in-progress release submission as a draft so you can resume it later", expires: "Local storage — until you clear it" },
            ]} />

            <p className="text-white/80 font-semibold mt-6">Analytics</p>
            <p>
              We use Google Analytics (GA4) to understand how visitors use our site — which pages are
              most visited, how people find us, and where they drop off. This data is aggregated and
              anonymous; we cannot identify individual users.
            </p>
            <CookieTable rows={[
              { name: "_ga", type: "Analytics", purpose: "Google Analytics — distinguishes unique users", expires: "2 years" },
              { name: "_ga_*", type: "Analytics", purpose: "Google Analytics — stores session state", expires: "2 years" },
            ]} />
          </Section>

          <Section title="3. Third-Party Cookies">
            <p>
              Some pages on our platform include embedded content from third-party services. These
              services may set their own cookies:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white/80">Spotify</strong> — embedded track players on artist pages may set Spotify cookies
              </li>
              <li>
                <strong className="text-white/80">YouTube</strong> — embedded music videos may set YouTube / Google cookies
              </li>
              <li>
                <strong className="text-white/80">Google Analytics</strong> — see Section 2 above
              </li>
            </ul>
            <p>
              We do not control third-party cookies. Refer to each provider&apos;s privacy policy for
              details.
            </p>
          </Section>

          <Section title="4. Managing Cookies">
            <p>
              You can control and delete cookies through your browser settings. Be aware that disabling
              cookies may affect how the platform works — in particular, you will not be able to stay
              logged in to your artist portal without session cookies.
            </p>
            <p>Browser cookie settings for major browsers:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#007bff] hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-[#007bff] hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#007bff] hover:underline">Safari (macOS)</a></li>
              <li><a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies" target="_blank" rel="noopener noreferrer" className="text-[#007bff] hover:underline">Microsoft Edge</a></li>
            </ul>
            <p>
              To opt out of Google Analytics specifically, you can install the{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#007bff] hover:underline">
                Google Analytics Opt-out Browser Add-on
              </a>.
            </p>
          </Section>

          <Section title="5. Changes to This Policy">
            <p>
              We may update this Cookie Policy from time to time. When we do, we will update the date
              at the top of this page. Continued use of orinlabi.com after any changes constitutes
              acceptance of the updated policy.
            </p>
          </Section>

          <Section title="6. Contact">
            <p>
              Questions about this Cookie Policy?{" "}
              <a href="mailto:info@orinlabi.com" className="text-[#007bff] hover:underline">
                info@orinlabi.com
              </a>
            </p>
          </Section>
        </div>
      </div>
    </section>
  );
}
