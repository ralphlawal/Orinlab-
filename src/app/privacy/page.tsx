export const metadata = {
  title: "Privacy Policy – Orinlabi",
};

export default function PrivacyPage() {
  return (
    <section className="pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: June 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/60 leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-xl mb-3">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us when creating an
              account, submitting a release, or contacting us — including your
              name, email address, phone number, and payment information.
            </p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-xl mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              We use your information to provide and improve our services,
              process transactions, send notifications about your releases, and
              communicate with you about Orinlabi services.
            </p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-xl mb-3">
              3. Information Sharing
            </h2>
            <p>
              We do not sell your personal information. We may share information
              with distribution partners (such as Ditto Music) solely to
              facilitate the delivery of your music to streaming platforms.
            </p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-xl mb-3">
              4. Contact
            </h2>
            <p>
              For privacy inquiries, contact us at{" "}
              <a
                href="mailto:privacy@orinlabi.com"
                className="text-[#007bff] hover:underline"
              >
                privacy@orinlabi.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
