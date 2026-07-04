export const metadata = {
  title: "Terms of Service",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-white font-semibold text-xl">{title}</h2>
      <div className="text-white/60 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <section className="pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: June 2026</p>

        <div className="space-y-10">
          <Section title="1. Agreement to Terms">
            <p>
              By accessing or using OrinlabÍ Records services — including our website, artist portal,
              and distribution platform — you agree to be bound by these Terms of Service.
              If you do not agree, please do not use our services.
            </p>
            <p>
              OrinlabÍ Records is operated by the{" "}
              <a
                href="https://ralphlawalgroup.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#007bff] hover:underline"
              >
                Ralph Lawal Group
              </a>
              . These terms govern your use of all OrinlabÍ Records services.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              Any independent artist may submit music for distribution through OrinlabÍ Records.
              Submitted music is reviewed by our team and approved promptly. You must be at least
              18 years old, or have the consent of a parent or legal guardian, to apply for or
              use our services.
            </p>
          </Section>

          <Section title="3. Artist Rights & Ownership">
            <p>
              Artists retain full ownership of their masters and copyrights. By submitting
              your music for distribution, you grant OrinlabÍ Records a non-exclusive, worldwide,
              royalty-free licence to distribute, reproduce, and make available your music
              on streaming platforms solely for the purpose of fulfilling distribution.
            </p>
            <p>
              Public credits on platforms will appear as ℗ [Year] [Copyright Owner] /
              © [Year] [Copyright Owner] as specified in your application. You are responsible
              for ensuring the accuracy of all copyright information you provide.
            </p>
          </Section>

          <Section title="4. Content Standards">
            <p>
              You are solely responsible for ensuring all submitted content:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>Is original and does not infringe any third-party intellectual property rights</li>
              <li>Does not contain defamatory, obscene, or unlawful material</li>
              <li>Complies with all applicable laws and platform policies</li>
              <li>Accurately reflects the metadata and credits you provide</li>
            </ul>
            <p>
              OrinlabÍ Records reserves the right to reject or remove content that violates these
              standards or the policies of partner streaming platforms, without liability.
            </p>
          </Section>

          <Section title="5. Distribution & Royalties">
            <p>
              Distribution through OrinlabÍ Records is provided to approved artists under terms
              agreed in your individual artist agreement. We do not take a commission on your streaming royalties.
            </p>
            <p>
              Royalties are collected from streaming platforms and disbursed to artists
              according to the specific terms agreed upon in your individual artist agreement.
              OrinlabÍ Records does not guarantee specific royalty amounts, as these depend on
              platform payment structures beyond our control.
            </p>
          </Section>

          <Section title="6. Termination">
            <p>
              Either party may terminate the distribution relationship with written notice.
              Upon termination, we will initiate the removal of your music from streaming
              platforms. Removal timelines are subject to each platform's processing schedule
              and may take 4–8 weeks to take full effect.
            </p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>
              OrinlabÍ Records is not liable for any indirect, incidental, or consequential damages
              arising from your use of our services, including but not limited to loss of
              revenue, data, or business opportunities. Our total liability for any claim
              shall not exceed the amount paid by you to OrinlabÍ Records in the preceding 12 months
              (which shall not exceed the amount paid by you to OrinlabÍ Records under your artist agreement).
            </p>
          </Section>

          <Section title="8. Changes to These Terms">
            <p>
              We may update these Terms of Service at any time. Material changes will be
              communicated by posting an updated version on this page with a revised date.
              Continued use of our services after changes take effect constitutes acceptance.
            </p>
          </Section>

          <Section title="9. Governing Law">
            <p>
              These Terms are governed by the laws of the Federal Republic of Nigeria.
              Any disputes shall be subject to the exclusive jurisdiction of the courts of
              Lagos State, Nigeria.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              For questions about these Terms, email us at{" "}
              <a href="mailto:legal@orinlabi.com" className="text-[#007bff] hover:underline">
                legal@orinlabi.com
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </section>
  );
}
