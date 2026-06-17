"use client";

import { useEffect, useState } from "react";
import { Mail, MessageCircle, AtSign, MapPin, CheckCircle2, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getSetting, DEFAULT_CONTACT, type ContactInfo } from "@/lib/siteSettings";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ci, setCi] = useState<ContactInfo>(DEFAULT_CONTACT);

  useEffect(() => {
    getSetting<ContactInfo>("contact_info", DEFAULT_CONTACT).then(setCi);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const { error: dbError } = await supabase.from("contact_messages").insert({
      name: data.get("name"),
      email: data.get("email"),
      subject: data.get("subject"),
      message: data.get("message"),
      inquiry_type: data.get("inquiryType") || null,
    });
    setLoading(false);
    if (dbError) { setError("Something went wrong. Please try again."); return; }

    // Notify admin — fire and forget
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "new-contact",
        data: {
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
          inquiry_type: data.get("inquiryType") || null,
        },
      }),
    }).catch(() => {});

    setSent(true);
  }

  return (
    <>
      {/* Header */}
      <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#007bff]/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
            Contact Us
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            Let&apos;s Talk.
          </h1>
          <p className="text-white/60 text-lg">
            Have a question, partnership inquiry, or just want to say hello?
            We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-8 px-4 pb-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12">
          {/* Left — contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-white font-bold text-2xl mb-2">
                Get In Touch
              </h2>
              <p className="text-white/50 leading-relaxed">
                Our team is available {ci.hours}. We typically respond within 24 hours.
              </p>
            </div>

            <div className="space-y-4">
              <ContactDetail
                icon={<Mail size={20} />}
                label="Email"
                value={ci.email}
                href={`mailto:${ci.email}`}
              />
              <ContactDetail
                icon={<MessageCircle size={20} />}
                label="WhatsApp / Phone"
                value={ci.phone}
                href={ci.whatsapp_url}
              />
              <ContactDetail
                icon={<AtSign size={20} />}
                label="Instagram"
                value={ci.instagram}
                href={ci.instagram_url}
              />
              <ContactDetail
                icon={<X size={20} />}
                label="X (Twitter)"
                value={ci.twitter}
                href={ci.twitter_url}
              />
              <ContactDetail
                icon={<MapPin size={20} />}
                label="Address"
                value={ci.address}
                href={undefined}
              />
            </div>

            {/* Social buttons */}
            <div className="pt-4">
              <p className="text-white/30 text-xs uppercase tracking-widest mb-4">
                Follow Us
              </p>
              <div className="flex gap-3 flex-wrap">
                <a
                  href={ci.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2.5 rounded-full transition-all duration-200"
                >
                  <AtSign size={16} /> Instagram
                </a>
                <a
                  href={ci.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2.5 rounded-full transition-all duration-200"
                >
                  <X size={16} /> X
                </a>
                <a
                  href={ci.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2.5 rounded-full transition-all duration-200"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="h-full flex items-center justify-center text-center py-20 bg-white/[0.03] border border-white/[0.06] rounded-3xl">
                <div>
                  <div className="w-16 h-16 bg-[#007bff]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-[#007bff]" />
                  </div>
                  <h3 className="text-white font-bold text-2xl mb-3">
                    Message Sent!
                  </h3>
                  <p className="text-white/50">
                    Thanks for reaching out. We will get back to you within 24
                    hours.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-6 text-[#007bff] text-sm font-medium hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 space-y-6"
              >
                <h2 className="text-white font-bold text-xl">
                  Send Us a Message
                </h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <FormField label="Your Name" name="name" required />
                  <FormField label="Email Address" name="email" type="email" required />
                </div>

                <FormField label="Subject" name="subject" required />

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Message <span className="text-[#007bff]">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    placeholder="Tell us how we can help…"
                    className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-colors duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Inquiry Type
                  </label>
                  <select
                    name="inquiryType"
                    className="w-full bg-[#0a0a0a] border border-white/[0.1] focus:border-[#007bff] outline-none text-white text-sm px-4 py-3 rounded-xl transition-colors duration-200"
                  >
                    <option value="">Select inquiry type…</option>
                    <option>Artist Distribution</option>
                    <option>Marketing Services</option>
                    <option>Partnership</option>
                    <option>Press & Media</option>
                    <option>Technical Support</option>
                    <option>General Inquiry</option>
                  </select>
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold py-4 rounded-full transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function ContactDetail({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <div className="w-10 h-10 bg-[#007bff]/10 rounded-lg flex items-center justify-center text-[#007bff] flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-white font-medium text-sm">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-80 transition-opacity"
      >
        {content}
      </a>
    );
  }
  return content;
}

function FormField({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-white/70 text-sm font-medium mb-2">
        {label}
        {required && <span className="text-[#007bff] ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-colors duration-200"
      />
    </div>
  );
}
