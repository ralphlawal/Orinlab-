export const metadata = {
  title: "Privacy Policy",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-white font-semibold text-xl">{title}</h2>
      <div className="text-white/60 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <section className="pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: June 2026</p>

        <div className="space-y-10">
          <Section title="1. Introduction">
            <p>
              Orinlabí ("we," "us," or "our") operates orinlabi.com and provides
              invitation-based music distribution services for independent artists worldwide.
              This Privacy Policy explains how we collect, use, and protect your personal
              information when you interact with our platform.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect the following categories of information:</p>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>
                <span className="text-white/80 font-medium">Application data</span> — when you
                apply for distribution: artist name, full name, email address, phone number,
                and release details (song title, genre, cover art, audio files).
              </li>
              <li>
                <span className="text-white/80 font-medium">Contact form data</span> — name,
                email address, and message content submitted via our contact page.
              </li>
              <li>
                <span className="text-white/80 font-medium">Newsletter subscriptions</span> —
                email address and subscription status.
              </li>
              <li>
                <span className="text-white/80 font-medium">Artist portal data</span> — your
                email address used to authenticate via magic-link login, and session data.
              </li>
              <li>
                <span className="text-white/80 font-medium">Usage data</span> — browser type,
                IP address, pages visited, and time on site, collected via cookies and server
                logs.
              </li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>To review your distribution application and communicate our decision</li>
              <li>
                To distribute approved music to streaming platforms on your behalf
              </li>
              <li>
                To send notifications about your application status and release progress
              </li>
              <li>To respond to enquiries submitted through our contact form</li>
              <li>
                To send newsletters and updates (only with your explicit consent)
              </li>
              <li>To maintain and improve our platform</li>
              <li>To comply with applicable legal obligations</li>
            </ul>
          </Section>

          <Section title="4. Information Sharing">
            <p>We do not sell your personal information. We share data only in these circumstances:</p>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>
                <span className="text-white/80 font-medium">Distribution partners</span> —
                release metadata (artist name, song title, release date, copyright information)
                is shared with licensed streaming platforms to fulfil distribution.
              </li>
              <li>
                <span className="text-white/80 font-medium">Service providers</span> —
                trusted third-party services (cloud storage, email delivery, authentication)
                that operate under confidentiality obligations and process data only on our
                behalf.
              </li>
              <li>
                <span className="text-white/80 font-medium">Legal requirements</span> —
                when required by law, court order, or to protect the rights and safety of
                Orinlabí or others.
              </li>
            </ul>
          </Section>

          <Section title="5. Cookies">
            <p>
              We use cookies and similar technologies to operate and improve our website.
              You can manage your preferences via the consent banner on your first visit.
            </p>
            <p>We use the following types of cookies:</p>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>
                <span className="text-white/80 font-medium">Strictly necessary</span> —
                required for core functionality such as maintaining your artist portal
                session. These cannot be disabled.
              </li>
              <li>
                <span className="text-white/80 font-medium">Analytics</span> — help us
                understand how visitors use the site so we can improve it. Only set with
                your consent.
              </li>
              <li>
                <span className="text-white/80 font-medium">Preference</span> — remember
                your choices (such as cookie consent) between visits.
              </li>
            </ul>
            <p>
              You can manage or delete cookies at any time through your browser settings.
              Disabling cookies may affect some features of the site.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain personal information for as long as necessary to fulfil the purposes
              in this policy or as required by law. If your application is not approved, we
              hold your data for up to 12 months in case you reapply. You may request
              deletion of your data at any time (subject to legal requirements).
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>
              Depending on your location, you may have the right to access, correct, delete,
              or port your personal data, to object to or restrict certain processing, and to
              withdraw consent for newsletter communications at any time.
            </p>
            <p>
              To exercise any of these rights, email us at{" "}
              <a href="mailto:privacy@orinlabi.com" className="text-[#007bff] hover:underline">
                privacy@orinlabi.com
              </a>
              .
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              We implement appropriate technical and organisational measures to protect your
              information against unauthorised access, alteration, or disclosure. Access to
              personal data is restricted to personnel who require it to carry out their
              responsibilities.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              Our platform is not directed at children under 13. We do not knowingly collect
              personal information from children. If you believe a child has provided us with
              data, please contact us and we will promptly delete it.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically. We will notify you of material
              changes by posting a notice on our website or by email. Continued use of our
              platform after changes take effect constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              For privacy enquiries or to exercise your rights, contact us at{" "}
              <a href="mailto:privacy@orinlabi.com" className="text-[#007bff] hover:underline">
                privacy@orinlabi.com
              </a>
              . Orinlabí is operated by the{" "}
              <a
                href="https://ralphlawalgroup.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#007bff] hover:underline"
              >
                Ralph Lawal Group
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </section>
  );
}
