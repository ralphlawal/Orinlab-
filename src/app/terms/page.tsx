export const metadata = {
  title: "Terms of Service – Orinlabi",
};

export default function TermsPage() {
  return (
    <section className="pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: June 2026</p>

        <div className="space-y-8 text-white/60 leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-xl mb-3">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using Orinlabi services, you agree to be bound by
              these Terms. If you do not agree, do not use our services.
            </p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-xl mb-3">
              2. Artist Rights & Ownership
            </h2>
            <p>
              Artists retain full ownership of their masters and copyrights.
              Orinlabi is granted a non-exclusive license to distribute your
              music on your behalf. Public credits will appear as ℗ 2026
              Orinlabi / © 2026 Orinlabi as specified in your distribution
              agreement.
            </p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-xl mb-3">
              3. Content Standards
            </h2>
            <p>
              You are responsible for ensuring all submitted content is original,
              does not infringe third-party rights, and complies with applicable
              laws. Orinlabi reserves the right to reject content that violates
              platform policies.
            </p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-xl mb-3">
              4. Payments & Royalties
            </h2>
            <p>
              Royalties are paid monthly based on streaming reports received
              from platforms. Orinlabi takes no commission on royalties under
              subscription plans. Specific terms are governed by your signed
              artist agreement.
            </p>
          </section>
          <section>
            <h2 className="text-white font-semibold text-xl mb-3">
              5. Contact
            </h2>
            <p>
              Questions about these terms?{" "}
              <a
                href="mailto:legal@orinlabi.com"
                className="text-[#007bff] hover:underline"
              >
                legal@orinlabi.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
