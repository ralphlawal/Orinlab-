export const metadata = {
  title: "Terms of Service & Distribution Agreement",
  description: "The terms that govern distribution, royalties, and your rights as an artist on OrinlabÍ Records.",
  alternates: { canonical: "https://orinlabi.com/terms" },
  openGraph: {
    title: "Terms of Service & Distribution Agreement – OrinlabÍ Records",
    description: "The terms that govern distribution, royalties, and your rights as an artist on OrinlabÍ Records.",
    url: "https://orinlabi.com/terms",
    type: "website",
  },
};

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3" id={`section-${number}`}>
      <h2 className="text-white font-semibold text-lg">
        <span className="text-white/30 mr-2">{number}.</span>{title}
      </h2>
      <div className="text-white/60 leading-relaxed text-sm space-y-3">{children}</div>
    </section>
  );
}

const TOC = [
  ["1", "Definitions"],
  ["2", "Grant of Rights"],
  ["3", "Term & Renewal"],
  ["4", "Revenue Share & Royalties"],
  ["5", "Artist Representations & Warranties"],
  ["6", "Delivery Standards & Metadata"],
  ["7", "Content Compliance & Takedowns"],
  ["8", "Anti-Fraud & Stream Manipulation"],
  ["9", "Intellectual Property & Credits"],
  ["10", "Termination"],
  ["11", "Limitation of Liability"],
  ["12", "Confidentiality"],
  ["13", "Governing Law & Dispute Resolution"],
  ["14", "Changes to These Terms"],
  ["15", "Contact"],
];

export default function TermsPage() {
  return (
    <section className="pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-2">Including the Digital Music Distribution Agreement for all artists</p>
        <p className="text-white/30 text-xs mb-10">Version 1.0 · July 2026</p>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-8 text-sm text-white/60 leading-relaxed">
          By using OrinlabÍ Records services — including the Artist Portal and submitting music for distribution — you agree to these Terms. They apply from the moment you first log in and cover every Release you submit. You retain full ownership of your music at all times.
        </div>

        {/* Table of contents */}
        <nav className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 mb-12">
          <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">Contents</p>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {TOC.map(([num, label]) => (
              <li key={num}>
                <a
                  href={`#section-${num}`}
                  className="flex items-baseline gap-2 text-sm text-white/50 hover:text-white transition-colors py-0.5"
                >
                  <span className="text-white/20 text-xs w-5 flex-shrink-0">{num}.</span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10">
          <Section number="1" title="Definitions">
            <p>In these Terms, the following words have the meanings set out below:</p>
            <dl className="space-y-3">
              {([
                ["Agreement", "These Terms of Service & Digital Music Distribution Agreement, as amended from time to time."],
                ["Artist", "The individual or entity that registers for and uses the OrinlabÍ Records Artist Portal to submit Releases for distribution."],
                ["Artist Portal", "The web-based platform accessible at orinlabi.com through which the Artist manages their account, submits Releases, and receives royalty statements."],
                ["DSP (Digital Service Provider)", "Any digital streaming or download platform — including but not limited to Spotify, Apple Music, TikTok, YouTube Music, Amazon Music, Boomplay, Audiomack, Deezer, and TIDAL — to which OrinlabÍ Records delivers Releases on the Artist's behalf."],
                ["ISRC", "International Standard Recording Code — the unique identifier assigned to each individual sound recording."],
                ["Metadata", "Descriptive information submitted alongside a Release, including track title, artist name, album title, genre, release date, songwriter credits, producer credits, ISRC, UPC, and publishing information."],
                ["Net Revenue", "Gross revenue actually received by OrinlabÍ Records from DSPs in respect of a Release, less withholding taxes, banking transfer fees, currency conversion charges, and any deductions imposed by the relevant DSP or financial institution. It does not include amounts collected and passed through to third parties such as publishing societies."],
                ["Release", "Any single, EP, album, or other audio recording submitted by the Artist through the Artist Portal for distribution to DSPs."],
                ["Service Fee", "The percentage of Net Revenue retained by OrinlabÍ Records as set out in Section 4."],
                ["Takedown", "The removal of a Release from one or more DSPs at the request of the Artist, OrinlabÍ Records, or as required by a DSP, rights holder, or legal authority."],
                ["UPC", "Universal Product Code — the barcode identifier assigned to a Release as a product."],
              ] as [string, string][]).map(([term, def]) => (
                <div key={term} className="pl-3 border-l border-white/[0.08]">
                  <dt className="text-white/80 font-semibold text-sm mb-0.5">{term}</dt>
                  <dd className="text-white/50">{def}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section number="2" title="Grant of Rights">
            <p>
              The Artist grants to OrinlabÍ Records a <strong className="text-white/80">non-exclusive, worldwide licence</strong> to distribute, reproduce, transmit, and make available their Releases and associated artwork and Metadata on DSPs.
            </p>
            <p>
              This licence is limited to digital distribution. It does not transfer ownership of any master recording, sound recording copyright, underlying musical composition, or any other intellectual property right to OrinlabÍ Records.
            </p>
            <p>
              The Artist retains the right to distribute their Releases through other channels, provided that doing so does not create conflicting exclusivity obligations with any DSP.
            </p>
          </Section>

          <Section number="3" title="Term & Renewal">
            <p>
              These Terms commence on the date you first use the service and continue for an initial period of two (2) years. They automatically renew for successive one-year periods unless either party gives sixty (60) days&apos; written notice of non-renewal before the end of the then-current term.
            </p>
            <p>
              The Artist may request early termination via the Artist Portal. Termination takes effect ninety (90) days from receipt of notice; distribution services continue normally during that period. Early termination does not affect the Artist&apos;s right to royalties accrued before the effective termination date.
            </p>
          </Section>

          <Section number="4" title="Revenue Share & Royalties">
            <p><strong className="text-white/80">Free first release.</strong> Your first Release is distributed at no cost. You receive and retain 100% of Net Revenue generated by that Release for as long as these Terms remain in force.</p>
            <p><strong className="text-white/80">Subsequent releases.</strong> For your second and all further Releases, OrinlabÍ Records remits <strong className="text-white/80">85% of Net Revenue</strong> to you and retains 15% as the Service Fee. The Service Fee covers delivery to all DSPs, ISRC/UPC management, Metadata maintenance, royalty collection, and Artist Portal access.</p>
            <p><strong className="text-white/80">Royalty reporting.</strong> Quarterly statements are available in the Artist Portal within 45 days of the close of each calendar quarter (Q1: Jan–Mar; Q2: Apr–Jun; Q3: Jul–Sep; Q4: Oct–Dec).</p>
            <p><strong className="text-white/80">Payment.</strong> Royalties are paid when your cumulative unpaid balance reaches USD $50.00, within 30 days of the close of the applicable quarter. Balances below $50 roll forward to the following quarter without penalty or expiry.</p>
            <p><strong className="text-white/80">Currency.</strong> Payments are made in USD by default. Where local currency payment is requested, OrinlabÍ Records will convert at the mid-market rate on the date of payment; conversion charges form part of the deductions from Net Revenue.</p>
            <p><strong className="text-white/80">Disputes.</strong> Royalty statement disputes must be raised in writing within ninety (90) days of the statement being issued. Disputes received after that period will not be considered unless required by applicable law.</p>
          </Section>

          <Section number="5" title="Artist Representations & Warranties">
            <p>By submitting a Release, you represent and warrant that:</p>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>You own or have fully cleared all rights in the Release, including masters, compositions, lyrics, and any sampled, interpolated, or licensed material</li>
              <li>The Release does not infringe any third-party intellectual property right, right of publicity, or any applicable law</li>
              <li>You have full legal capacity to enter into these Terms</li>
              <li>All featured artists, co-writers, session musicians, and producers have consented to distribution under these Terms and have been or will be compensated appropriately</li>
              <li>All Metadata, credits, and copyright information you provide are accurate, complete, and not misleading</li>
              <li>The Release has not been delivered to a DSP under a conflicting exclusive arrangement</li>
              <li>You are not subject to any court order or contractual restriction that would prevent you from entering into or performing this Agreement</li>
            </ul>
            <p>These representations are deemed repeated each time you submit a Release. A breach of any representation is grounds for immediate termination under Section 10.</p>
          </Section>

          <Section number="6" title="Delivery Standards & Metadata">
            <p><strong className="text-white/80">Audio.</strong> Releases must be delivered as WAV or FLAC files at a minimum of 16-bit / 44.1 kHz. Lossy formats (MP3, AAC) are not accepted as primary delivery files.</p>
            <p><strong className="text-white/80">Artwork.</strong> Cover artwork must be a minimum of 3,000 × 3,000 pixels in JPEG or PNG format, in the sRGB colour space. Artwork must not contain logos of competing services, website URLs (unless part of an approved artistic design), or borders imposed at the edges.</p>
            <p><strong className="text-white/80">Metadata.</strong> You must supply accurate and complete Metadata at submission, including ISRC codes (one per track), songwriter and producer credits, publishing information, release date, and genre. OrinlabÍ Records may generate ISRCs on your behalf where none are supplied, at no additional charge.</p>
            <p>OrinlabÍ Records is not liable for errors, DSP-imposed delays, or content rejections caused by non-conforming files or inaccurate Metadata you provide. We reserve the right to reject non-conforming submissions and will notify you with specific reasons within five (5) business days.</p>
          </Section>

          <Section number="7" title="Content Compliance & Takedowns">
            <p>You agree not to submit Releases that:</p>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>Contain unlicensed samples, interpolations, or copyrighted third-party material without proper clearance</li>
              <li>Constitute hate speech, incitement to violence, or content targeting protected characteristics</li>
              <li>Contain or depict sexual content involving minors</li>
              <li>Violate any applicable law, including defamation, harassment, or invasion of privacy</li>
              <li>Are intentionally misleading about their origin, authorship, or the identity of the performing artist</li>
            </ul>
            <p>If a DSP issues a takedown notice, content dispute, or copyright claim, OrinlabÍ Records will notify you promptly. You agree to cooperate fully to resolve the dispute, including providing proof of rights clearance within seven (7) business days of request.</p>
            <p>OrinlabÍ Records reserves the right to remove a Release from DSPs without prior notice upon receipt of a valid legal demand, a sustained copyright infringement claim upheld by a DSP, or evidence of content policy violation. Net Revenue accrued before removal will be paid in accordance with Section 4.</p>
          </Section>

          <Section number="8" title="Anti-Fraud & Stream Manipulation">
            <p>OrinlabÍ Records has a zero-tolerance policy for fraudulent streaming activity. You must not, and must not instruct or enable others to:</p>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>Use bots, scripts, or automated systems to generate artificial streams, plays, downloads, or saves</li>
              <li>Engage stream farms, click farms, or any third-party service that provides artificial engagement</li>
              <li>Manipulate DSP playlist placement, chart positions, or algorithmic recommendations through artificial means</li>
              <li>Engage in any conduct that DSPs identify as fraudulent or in violation of their terms of service</li>
            </ul>
            <p><strong className="text-white/80">Consequences.</strong> If OrinlabÍ Records or a DSP determines that a Release has been subject to fraudulent activity, OrinlabÍ Records may: (a) withhold royalties attributed to the fraudulent activity; (b) immediately remove the affected Release from all DSPs; (c) terminate this Agreement; and (d) report the matter to the relevant DSP. OrinlabÍ Records will not be liable for any losses arising from DSP-imposed account sanctions due to your fraudulent activity.</p>
            <p><strong className="text-white/80">DSP clawbacks.</strong> If a DSP recoups royalties already paid to OrinlabÍ Records due to detected fraud on your Releases, OrinlabÍ Records reserves the right to deduct the clawed-back amount from future royalty payments owed to you or to recover it directly.</p>
          </Section>

          <Section number="9" title="Intellectual Property & Credits">
            <p>You retain full ownership of all intellectual property in your Releases, including the sound recording copyright and underlying musical composition. OrinlabÍ Records acquires no ownership interest under these Terms.</p>
            <p>Public credits (℗ and © lines) on DSPs will reflect your own name or label name as provided in your Metadata — not OrinlabÍ Records. OrinlabÍ Records may appear solely as the &quot;Distributed by&quot; entity where DSPs separately display distributor information; this does not constitute a claim of ownership or co-authorship.</p>
            <p>You grant OrinlabÍ Records a limited, royalty-free licence to use your name, artist name, and approved artwork for the sole purpose of promoting your Releases and the OrinlabÍ Records platform. You may revoke this promotional licence in writing at any time; revocation does not affect distribution rights.</p>
          </Section>

          <Section number="10" title="Termination">
            <p><strong className="text-white/80">By either party.</strong> Either party may terminate by giving sixty (60) days&apos; written notice via the Artist Portal or email to info@orinlabi.com.</p>
            <p><strong className="text-white/80">Immediate termination by OrinlabÍ Records.</strong> OrinlabÍ Records may terminate with immediate effect if you:</p>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>Materially breach these Terms and fail to cure within fourteen (14) days of written notice</li>
              <li>Provide materially false representations or warranties</li>
              <li>Engage in fraudulent streaming or anti-fraud policy violations under Section 8</li>
              <li>Engage in conduct that brings OrinlabÍ Records into disrepute or exposes it to legal liability</li>
              <li>Become subject to bankruptcy, insolvency proceedings, or a court order that prevents performance</li>
            </ul>
            <p><strong className="text-white/80">Effect of termination.</strong> On termination, OrinlabÍ Records will initiate Takedown from all DSPs within thirty (30) business days. Royalties legitimately accrued before the termination date will be paid within ninety (90) days of the effective termination date.</p>
          </Section>

          <Section number="11" title="Limitation of Liability">
            <p>To the maximum extent permitted by applicable law:</p>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li>OrinlabÍ Records&apos;s total aggregate liability shall not exceed the total Net Revenue remitted to you in the six (6) calendar months immediately preceding the event giving rise to the claim</li>
              <li>OrinlabÍ Records is not liable for indirect, incidental, consequential, special, or punitive damages — including loss of profits, loss of revenue, loss of data, or loss of business opportunity — whether or not OrinlabÍ Records was advised of the possibility of such damages</li>
              <li>OrinlabÍ Records is not liable for delays or failures caused by DSP technical systems, force majeure events, internet infrastructure disruptions, or your failure to deliver conforming Release files</li>
              <li>OrinlabÍ Records is not liable for any decision made by a DSP regarding playlist placement, algorithmic promotion, or content removal</li>
            </ul>
            <p>Nothing in these Terms limits liability that cannot be excluded under applicable law, including for fraud or fraudulent misrepresentation by OrinlabÍ Records.</p>
          </Section>

          <Section number="12" title="Confidentiality">
            <p>Each party agrees to treat as confidential any non-public information received from the other in connection with these Terms — including royalty statements, business terms, fee structures, and analytics — and will not disclose it to third parties without prior written consent, except as required by applicable law or court order.</p>
            <p>Confidentiality obligations survive termination for three (3) years. They do not apply to information that: (a) is or becomes publicly available through no fault of the receiving party; (b) was already known to the receiving party before disclosure; or (c) is independently developed by the receiving party without reference to the disclosing party&apos;s information.</p>
          </Section>

          <Section number="13" title="Governing Law & Dispute Resolution">
            <p>These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without reference to its conflict of law principles.</p>
            <p>In the event of a dispute, the parties agree to: (a) first attempt good-faith negotiation for thirty (30) days from written notice of the dispute; (b) if negotiation fails, submit the dispute to mediation in Lagos, Nigeria; and (c) if mediation fails within sixty (60) days, refer the dispute to the exclusive jurisdiction of the competent courts of Lagos State, Nigeria.</p>
            <p>Nothing in this clause prevents either party from seeking urgent injunctive or other equitable relief from a court of competent jurisdiction.</p>
          </Section>

          <Section number="14" title="Changes to These Terms">
            <p>OrinlabÍ Records may update these Terms at any time. Material changes — including changes to the revenue share percentage, payment thresholds, or dispute resolution procedures — will be communicated via the Artist Portal and email no less than thirty (30) days before taking effect.</p>
            <p>Non-material changes (such as typographical corrections or contact detail updates) may take effect immediately. Continued use of the service after the effective date of any change constitutes acceptance. If you do not accept a material change, you may terminate in accordance with Section 10.</p>
          </Section>

          <Section number="15" title="Contact">
            <p>
              For questions about these Terms, or to submit written notices required under this Agreement, contact OrinlabÍ Records at:{" "}
              <a href="mailto:info@orinlabi.com" className="text-[#007bff] hover:underline">
                info@orinlabi.com
              </a>
              .
            </p>
            <p className="text-white/25 text-xs pt-2">OrinlabÍ Records · Lagos, Nigeria · Version 1.0 · July 2026</p>
          </Section>
        </div>
      </div>
    </section>
  );
}
