"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  Loader2, Music2, Globe, CheckCircle2, Clock, XCircle,
  ChevronDown, ChevronUp, Save, User, BarChart3, Send,
  UserCheck, UserX, TrendingUp, CreditCard, Link2,
  DollarSign, AlertTriangle, Zap, Radio,
  FileText, MessageSquare,
} from "lucide-react";
import { PlatformIcon } from "@/components/PlatformIcon";
import { getPlatform } from "@/lib/platforms";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReleaseRow = {
  id: string;
  email: string;
  artist_name: string;
  song_title: string | null;
  genre: string | null;
  country: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  streams: Record<string, number> | null;
  royalties_usd: number | null;
  cover_art_url: string | null;
};

type ProfileRow = {
  email: string;
  artist_name: string | null;
  bio: string | null;
  country: string | null;
  artist_image_url: string | null;
  instagram_handle: string | null;
  x_handle: string | null;
  tiktok_username: string | null;
  youtube_channel: string | null;
  facebook_url: string | null;
  website_url: string | null;
  spotify_artist_id: string | null;
  apple_music_artist_id: string | null;
  audiomack_id: string | null;
  boomplay_id: string | null;
  deezer_id: string | null;
  amazon_id: string | null;
  soundcloud_id: string | null;
  record_label: string | null;
  payout_method: string | null;
  paypal_email: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_country: string | null;
  mobile_money_provider: string | null;
  mobile_money_number: string | null;
  account_status: "active" | "suspended" | null;
};

type Artist = {
  email: string;
  artist_name: string;
  bio: string | null;
  country: string | null;
  genre: string | null;
  photo: string | null;
  instagram_handle: string | null;
  x_handle: string | null;
  tiktok_username: string | null;
  youtube_channel: string | null;
  facebook_url: string | null;
  website_url: string | null;
  spotify_artist_id: string | null;
  apple_music_artist_id: string | null;
  audiomack_id: string | null;
  boomplay_id: string | null;
  deezer_id: string | null;
  amazon_id: string | null;
  soundcloud_id: string | null;
  record_label: string | null;
  payout_method: string | null;
  paypal_email: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_country: string | null;
  mobile_money_provider: string | null;
  mobile_money_number: string | null;
  total_releases: number;
  approved_releases: number;
  total_streams: number;
  total_royalties: number;
  latest_status: "pending" | "approved" | "rejected";
  joined: string;
  releases: ReleaseRow[];
  accountStatus: "active" | "suspended";
};

const statusCfg = {
  approved: { icon: CheckCircle2, label: "Approved", color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20" },
  pending:  { icon: Clock,        label: "Pending",  color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  rejected: { icon: XCircle,      label: "Rejected", color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20" },
};

const STREAM_PLATFORMS = ["spotify", "apple_music", "youtube", "boomplay", "audiomack", "deezer", "tidal", "amazon_music"];

function fmtN(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
    : n.toString();
}

const inp = "w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-3 py-2 rounded-lg transition-colors";
const inp2 = "w-full bg-white/[0.04] border border-white/[0.06] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-3 py-2 rounded-lg transition-colors";

// ─── Quick email templates for per-artist message tab ─────────────────────────

type MsgTemplate = { id: string; label: string; icon: React.ElementType; color: string; title: string; body: string; type: "info" | "success" | "warning" | "error" };

const MSG_TEMPLATES: MsgTemplate[] = [
  { id: "custom",          label: "Custom",          icon: MessageSquare, color: "#8B5CF6", title: "",  body: "",  type: "info"    },
  { id: "streams_update",  label: "Streams Update",  icon: BarChart3,     color: "#007bff", title: "Streams Update",   body: "Your music is accumulating streams. Log in to your portal to see the latest numbers.", type: "info" },
  { id: "royalty_ready",   label: "Royalties Ready", icon: DollarSign,    color: "#10B981", title: "Royalties Available", body: "Your royalties are now available. You can request a payout from the Earnings section of your portal.", type: "success" },
  { id: "release_live",    label: "Release Live",    icon: Zap,           color: "#8B5CF6", title: "You're Live!",     body: "Your release is now live on streaming platforms. Share your smart link with your fans!", type: "success" },
  { id: "action_needed",   label: "Action Needed",   icon: AlertTriangle, color: "#F59E0B", title: "Action Required",  body: "There's something that needs your attention in your portal. Please log in and check your notifications.", type: "warning" },
  { id: "pitch_accepted",  label: "Pitch Accepted",  icon: Radio,         color: "#8B5CF6", title: "Pitch Accepted!",  body: "Congratulations — your pitch has been accepted! Check your portal for more details.", type: "success" },
  { id: "payout_sent",     label: "Payout Sent",     icon: CreditCard,    color: "#10B981", title: "Payout Sent",      body: "Your payout has been processed and is on its way. Please allow 3–5 business days for funds to arrive.", type: "success" },
  { id: "platform_issue",  label: "Platform Issue",  icon: AlertTriangle, color: "#F43F5E", title: "Platform Issue",   body: "There's an issue with your release on one of the streaming platforms. Our team is looking into it.", type: "error" },
  { id: "isrc_assigned",   label: "ISRC Assigned",   icon: FileText,      color: "#007bff", title: "ISRC/UPC Assigned", body: "Your ISRC/UPC code has been assigned. Log in to your portal to view the details.", type: "info" },
];

// ─── Artist Edit Panel ────────────────────────────────────────────────────────

function EditPanel({ artist, onSaved }: { artist: Artist; onSaved: (updated: Partial<Artist>) => void }) {
  const { requestUnlock } = usePinGate();
  const [editTab, setEditTab] = useState<"profile" | "social" | "ids" | "payment" | "releases" | "message">("profile");

  // Profile fields
  const [name,      setName]      = useState(artist.artist_name);
  const [bio,       setBio]       = useState(artist.bio ?? "");
  const [country,   setCountry]   = useState(artist.country ?? "");
  const [photo,     setPhoto]     = useState(artist.photo ?? "");
  const [label,     setLabel]     = useState(artist.record_label ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile,  setSavedProfile]  = useState(false);

  // Social fields
  const [instagram, setInsta]     = useState(artist.instagram_handle ?? "");
  const [xHandle,   setXHandle]   = useState(artist.x_handle ?? "");
  const [tiktok,    setTiktok]    = useState(artist.tiktok_username ?? "");
  const [youtube,   setYoutube]   = useState(artist.youtube_channel ?? "");
  const [facebook,  setFacebook]  = useState(artist.facebook_url ?? "");
  const [website,   setWebsite]   = useState(artist.website_url ?? "");
  const [savingSocial, setSavingSocial] = useState(false);
  const [savedSocial,  setSavedSocial]  = useState(false);

  // Platform IDs
  const [spotify,    setSpotify]    = useState(artist.spotify_artist_id ?? "");
  const [apple,      setApple]      = useState(artist.apple_music_artist_id ?? "");
  const [audiomack,  setAudiomack]  = useState(artist.audiomack_id ?? "");
  const [boomplay,   setBoomplay]   = useState(artist.boomplay_id ?? "");
  const [deezer,     setDeezer]     = useState(artist.deezer_id ?? "");
  const [amazon,     setAmazon]     = useState(artist.amazon_id ?? "");
  const [soundcloud, setSoundcloud] = useState(artist.soundcloud_id ?? "");
  const [savingIds, setSavingIds] = useState(false);
  const [savedIds,  setSavedIds]  = useState(false);

  // Payment fields
  const [payoutMethod,  setPayoutMethod]  = useState(artist.payout_method ?? "");
  const [paypalEmail,   setPaypalEmail]   = useState(artist.paypal_email ?? "");
  const [bankName,      setBankName]      = useState(artist.bank_name ?? "");
  const [bankAccName,   setBankAccName]   = useState(artist.bank_account_name ?? "");
  const [bankAccNum,    setBankAccNum]    = useState(artist.bank_account_number ?? "");
  const [bankCountry,   setBankCountry]   = useState(artist.bank_country ?? "");
  const [mobileProvider, setMobileProvider] = useState(artist.mobile_money_provider ?? "");
  const [mobileNumber,   setMobileNumber]   = useState(artist.mobile_money_number ?? "");
  const [savingPayment, setSavingPayment] = useState(false);
  const [savedPayment,  setSavedPayment]  = useState(false);

  // Releases tab
  const [relStats, setRelStats] = useState<Record<string, { streams: Record<string, string>; royalties: string }>>(
    () => {
      const init: Record<string, { streams: Record<string, string>; royalties: string }> = {};
      for (const r of artist.releases) {
        const s: Record<string, string> = {};
        for (const p of STREAM_PLATFORMS) s[p] = String(r.streams?.[p] ?? "");
        init[r.id] = { streams: s, royalties: String(r.royalties_usd ?? "") };
      }
      return init;
    }
  );
  const [savingRelease, setSavingRelease] = useState<string | null>(null);
  const [savedRelease,  setSavedRelease]  = useState<string | null>(null);

  // Message tab
  const [msgTemplateId, setMsgTemplateId] = useState("custom");
  const [msgTitle,  setMsgTitle]  = useState("");
  const [msgBody,   setMsgBody]   = useState("");
  const [msgType,   setMsgType]   = useState<"info" | "success" | "warning" | "error">("info");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgSent,    setMsgSent]   = useState(false);

  function applyTemplate(id: string) {
    setMsgTemplateId(id);
    const t = MSG_TEMPLATES.find((t) => t.id === id);
    if (t && t.id !== "custom") {
      setMsgTitle(t.title);
      setMsgBody(t.body);
      setMsgType(t.type);
    }
  }

  async function doSaveProfile() {
    setSavingProfile(true);
    await supabase.from("artist_profiles").upsert(
      { email: artist.email, artist_name: name.trim() || null, bio: bio.trim() || null, country: country.trim() || null, artist_image_url: photo.trim() || null, record_label: label.trim() || null },
      { onConflict: "email" }
    );
    setSavingProfile(false); setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 3000);
    onSaved({ artist_name: name, bio: bio || null, country: country || null, photo: photo || null, record_label: label || null });
  }

  async function doSaveSocial() {
    setSavingSocial(true);
    await supabase.from("artist_profiles").upsert(
      { email: artist.email, instagram_handle: instagram.trim() || null, x_handle: xHandle.trim() || null, tiktok_username: tiktok.trim() || null, youtube_channel: youtube.trim() || null, facebook_url: facebook.trim() || null, website_url: website.trim() || null },
      { onConflict: "email" }
    );
    setSavingSocial(false); setSavedSocial(true);
    setTimeout(() => setSavedSocial(false), 3000);
  }

  async function doSaveIds() {
    setSavingIds(true);
    await supabase.from("artist_profiles").upsert(
      { email: artist.email, spotify_artist_id: spotify.trim() || null, apple_music_artist_id: apple.trim() || null, audiomack_id: audiomack.trim() || null, boomplay_id: boomplay.trim() || null, deezer_id: deezer.trim() || null, amazon_id: amazon.trim() || null, soundcloud_id: soundcloud.trim() || null },
      { onConflict: "email" }
    );
    setSavingIds(false); setSavedIds(true);
    setTimeout(() => setSavedIds(false), 3000);
  }

  async function doSavePayment() {
    setSavingPayment(true);
    await supabase.from("artist_profiles").upsert(
      { email: artist.email, payout_method: payoutMethod.trim() || null, paypal_email: paypalEmail.trim() || null, bank_name: bankName.trim() || null, bank_account_name: bankAccName.trim() || null, bank_account_number: bankAccNum.trim() || null, bank_country: bankCountry.trim() || null, mobile_money_provider: mobileProvider.trim() || null, mobile_money_number: mobileNumber.trim() || null },
      { onConflict: "email" }
    );
    setSavingPayment(false); setSavedPayment(true);
    setTimeout(() => setSavedPayment(false), 3000);
  }

  async function doSaveRelease(releaseId: string) {
    setSavingRelease(releaseId);
    const stats = relStats[releaseId];
    const streamsObj: Record<string, number> = {};
    for (const [p, v] of Object.entries(stats.streams)) {
      const n = parseInt(v.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(n) && n > 0) streamsObj[p] = n;
    }
    const royalties = parseFloat(stats.royalties) || 0;
    await supabase.from("releases").update({ streams: Object.keys(streamsObj).length > 0 ? streamsObj : null, royalties_usd: royalties || null }).eq("id", releaseId);
    setSavingRelease(null); setSavedRelease(releaseId);
    setTimeout(() => setSavedRelease(null), 3000);
  }

  async function doSendMessage() {
    if (!msgTitle.trim() || !msgBody.trim()) return;
    setSendingMsg(true);
    await supabase.from("notifications").insert({ email: artist.email, type: msgType, title: msgTitle.trim(), body: msgBody.trim(), link: "/portal" });
    fetch("/api/notify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "admin-message", data: { email: artist.email, content: `${msgTitle.trim()}\n\n${msgBody.trim()}` } }),
    }).catch(() => {});
    setSendingMsg(false); setMsgSent(true);
    setTimeout(() => { setMsgSent(false); setMsgTitle(""); setMsgBody(""); setMsgTemplateId("custom"); }, 3000);
  }

  const TABS = [
    { id: "profile",  label: "Profile",  icon: User },
    { id: "social",   label: "Social",   icon: Link2 },
    { id: "ids",      label: "DSP IDs",  icon: Music2 },
    { id: "payment",  label: "Payment",  icon: CreditCard },
    { id: "releases", label: `Releases (${artist.releases.length})`, icon: BarChart3 },
    { id: "message",  label: "Message",  icon: Send },
  ] as const;

  const SaveBtn = ({ onClick, saving, saved, disabled }: { onClick: () => void; saving: boolean; saved: boolean; disabled?: boolean }) => (
    <button onClick={onClick} disabled={saving || disabled}
      className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
      {saving ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : saved ? <><CheckCircle2 size={12} /> Saved!</> : <><Save size={12} /> Save</>}
    </button>
  );

  return (
    <div className="mt-4 border-t border-white/[0.06] pt-4">
      {/* Tab bar */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setEditTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              editTab === t.id ? "bg-[#007bff]/15 text-[#007bff]" : "text-white/40 hover:text-white"
            }`}>
            <t.icon size={12} />{t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {editTab === "profile" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-white/50 text-xs mb-1">Artist Name</label><input className={inp} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label className="block text-white/50 text-xs mb-1">Country</label><input className={inp} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Nigeria" /></div>
          </div>
          <div><label className="block text-white/50 text-xs mb-1">Bio</label><textarea className={`${inp} resize-none`} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short artist bio…" /></div>
          <div><label className="block text-white/50 text-xs mb-1">Record Label</label><input className={inp} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Empire Records / Independent" /></div>
          <div>
            <label className="block text-white/50 text-xs mb-1">Photo URL</label>
            <input className={inp} value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://res.cloudinary.com/…" />
          </div>
          {photo && <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" className="w-full h-full object-cover" />
          </div>}
          <SaveBtn onClick={() => requestUnlock(doSaveProfile)} saving={savingProfile} saved={savedProfile} />
        </div>
      )}

      {/* Social tab */}
      {editTab === "social" && (
        <div className="space-y-3">
          <p className="text-white/30 text-xs mb-3">Social media handles and links for this artist.</p>
          {[
            { label: "Instagram Handle", val: instagram, set: setInsta, placeholder: "@artistname" },
            { label: "X / Twitter Handle", val: xHandle, set: setXHandle, placeholder: "@artistname" },
            { label: "TikTok Username", val: tiktok, set: setTiktok, placeholder: "@artistname" },
            { label: "YouTube Channel URL", val: youtube, set: setYoutube, placeholder: "https://youtube.com/@channel" },
            { label: "Facebook URL", val: facebook, set: setFacebook, placeholder: "https://facebook.com/artist" },
            { label: "Website URL", val: website, set: setWebsite, placeholder: "https://artist.com" },
          ].map(({ label, val, set, placeholder }) => (
            <div key={label}>
              <label className="block text-white/50 text-xs mb-1">{label}</label>
              <input className={inp} value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder} />
            </div>
          ))}
          <SaveBtn onClick={() => requestUnlock(doSaveSocial)} saving={savingSocial} saved={savedSocial} />
        </div>
      )}

      {/* DSP IDs tab */}
      {editTab === "ids" && (
        <div className="space-y-3">
          <p className="text-white/30 text-xs mb-3">Streaming platform artist IDs — used for analytics and verification.</p>
          {[
            { label: "Spotify Artist ID",     val: spotify,    set: setSpotify,    placeholder: "4Z8W4fKeB5YxbusRsdQVPb" },
            { label: "Apple Music Artist ID",  val: apple,      set: setApple,      placeholder: "123456789" },
            { label: "Audiomack ID",           val: audiomack,  set: setAudiomack,  placeholder: "artist-slug" },
            { label: "Boomplay ID",            val: boomplay,   set: setBoomplay,   placeholder: "artist-id" },
            { label: "Deezer Artist ID",       val: deezer,     set: setDeezer,     placeholder: "123456" },
            { label: "Amazon Music ID",        val: amazon,     set: setAmazon,     placeholder: "B08XXXXXX" },
            { label: "SoundCloud URL/Slug",    val: soundcloud, set: setSoundcloud, placeholder: "soundcloud.com/artist" },
          ].map(({ label, val, set, placeholder }) => (
            <div key={label}>
              <label className="block text-white/50 text-xs mb-1">{label}</label>
              <input className={inp} value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder} />
            </div>
          ))}
          <SaveBtn onClick={() => requestUnlock(doSaveIds)} saving={savingIds} saved={savedIds} />
        </div>
      )}

      {/* Payment tab */}
      {editTab === "payment" && (
        <div className="space-y-3">
          <div>
            <label className="block text-white/50 text-xs mb-1">Payout Method</label>
            <select className={`${inp} appearance-none bg-[#0a0a0a]`} value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)}>
              <option value="">— Not set —</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="PayPal">PayPal</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Wise">Wise</option>
            </select>
          </div>

          {(payoutMethod === "PayPal" || payoutMethod === "Wise") && (
            <div><label className="block text-white/50 text-xs mb-1">PayPal / Wise Email</label><input className={inp} value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="artist@email.com" /></div>
          )}

          {payoutMethod === "Bank Transfer" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-white/50 text-xs mb-1">Bank Name</label><input className={inp} value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="GTBank" /></div>
                <div><label className="block text-white/50 text-xs mb-1">Country</label><input className={inp} value={bankCountry} onChange={(e) => setBankCountry(e.target.value)} placeholder="Nigeria" /></div>
              </div>
              <div><label className="block text-white/50 text-xs mb-1">Account Name</label><input className={inp} value={bankAccName} onChange={(e) => setBankAccName(e.target.value)} placeholder="Full name on account" /></div>
              <div><label className="block text-white/50 text-xs mb-1">Account Number / IBAN</label><input className={inp} value={bankAccNum} onChange={(e) => setBankAccNum(e.target.value)} placeholder="0123456789" /></div>
            </>
          )}

          {payoutMethod === "Mobile Money" && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-white/50 text-xs mb-1">Provider</label><input className={inp} value={mobileProvider} onChange={(e) => setMobileProvider(e.target.value)} placeholder="MTN / Airtel" /></div>
              <div><label className="block text-white/50 text-xs mb-1">Number</label><input className={inp} value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="+234 000 0000" /></div>
            </div>
          )}

          <SaveBtn onClick={() => requestUnlock(doSavePayment)} saving={savingPayment} saved={savedPayment} />
        </div>
      )}

      {/* Releases tab */}
      {editTab === "releases" && (
        <div className="space-y-4">
          {artist.releases.length === 0 && <p className="text-white/30 text-xs">No releases found for this artist.</p>}
          {artist.releases.map((r) => {
            const cfg = statusCfg[r.status] ?? statusCfg.pending;
            const stats = relStats[r.id];
            return (
              <div key={r.id} className="border border-white/[0.06] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {r.cover_art_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.cover_art_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                    ) : (
                      <div className="w-9 h-9 bg-[#007bff]/10 rounded-lg flex items-center justify-center"><Music2 size={14} className="text-[#007bff]/40" /></div>
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">{r.song_title ?? "Untitled"}</p>
                      <p className="text-white/30 text-xs">{r.genre} · {new Date(r.submitted_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                </div>

                <div>
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Streams per Platform</p>
                  <div className="grid grid-cols-2 gap-2">
                    {STREAM_PLATFORMS.map((p) => {
                      const plt = getPlatform(p);
                      return (
                        <div key={p} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${plt.color}20`, color: plt.color }}>
                            <PlatformIcon platformKey={p} size={13} />
                          </div>
                          <span className="text-white/30 text-xs w-20 flex-shrink-0 truncate">{plt.label}</span>
                          <input className={`${inp2} py-1.5`} value={stats.streams[p]} onChange={(e) => setRelStats((prev) => ({ ...prev, [r.id]: { ...prev[r.id], streams: { ...prev[r.id].streams, [p]: e.target.value } } }))} placeholder="0" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-white/40 text-xs w-24 flex-shrink-0">Royalties (USD)</label>
                  <input className={`${inp2} py-1.5 max-w-[120px]`} value={stats.royalties} onChange={(e) => setRelStats((prev) => ({ ...prev, [r.id]: { ...prev[r.id], royalties: e.target.value } }))} placeholder="0.00" />
                </div>

                <button onClick={() => requestUnlock(() => doSaveRelease(r.id))} disabled={savingRelease === r.id}
                  className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                  {savingRelease === r.id ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : savedRelease === r.id ? <><CheckCircle2 size={12} className="text-green-400" /> Saved</> : <><Save size={12} /> Save Stats</>}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Message tab */}
      {editTab === "message" && (
        <div className="space-y-3">
          <p className="text-white/30 text-xs">Send a notification to <strong className="text-white/60">{artist.artist_name}</strong> — appears in-app and is emailed to <strong className="text-white/60">{artist.email}</strong>.</p>

          {/* Template picker */}
          <div>
            <label className="block text-white/50 text-xs mb-2">Quick Template</label>
            <div className="grid grid-cols-3 gap-1.5">
              {MSG_TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => applyTemplate(t.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-left text-xs font-medium transition-all ${
                    msgTemplateId === t.id ? "border-[#007bff]/40 bg-[#007bff]/10 text-white" : "border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.04]"
                  }`}>
                  <t.icon size={11} style={{ color: t.color, flexShrink: 0 }} />
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-white/50 text-xs">Notification Type</label>
            </div>
            <div className="flex gap-1.5">
              {(["info", "success", "warning", "error"] as const).map((t) => {
                const colors = { info: "#007bff", success: "#10B981", warning: "#F59E0B", error: "#F43F5E" };
                return (
                  <button key={t} onClick={() => setMsgType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                      msgType === t ? "text-white" : "border-white/10 text-white/30 hover:text-white"
                    }`}
                    style={msgType === t ? { background: colors[t] + "22", borderColor: colors[t] + "44", color: colors[t] } : {}}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1">Title / Subject</label>
            <input className={inp} value={msgTitle} onChange={(e) => setMsgTitle(e.target.value)} placeholder="e.g. Your release is ready to go live" />
          </div>
          <div>
            <label className="block text-white/50 text-xs mb-1">Message</label>
            <textarea className={`${inp} resize-none`} rows={4} value={msgBody} onChange={(e) => setMsgBody(e.target.value)} placeholder="Write your message…" />
          </div>

          {msgSent ? (
            <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
              <CheckCircle2 size={14} /> Sent! Artist will see it in their portal and receive an email.
            </div>
          ) : (
            <button onClick={() => requestUnlock(doSendMessage)} disabled={sendingMsg || !msgTitle.trim() || !msgBody.trim()}
              className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
              {sendingMsg ? <><Loader2 size={12} className="animate-spin" /> Sending…</> : <><Send size={12} /> Send Notification + Email</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminArtistsPage() {
  const { requestUnlock } = usePinGate();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [togglingEmail, setTogglingEmail] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: releases }, { data: profiles }] = await Promise.all([
        supabase
          .from("releases")
          .select("id, email, artist_name, song_title, genre, country, status, submitted_at, streams, royalties_usd, cover_art_url")
          .order("submitted_at", { ascending: false }),
        supabase
          .from("artist_profiles")
          .select("email, artist_name, bio, country, artist_image_url, instagram_handle, x_handle, tiktok_username, youtube_channel, facebook_url, website_url, spotify_artist_id, apple_music_artist_id, audiomack_id, boomplay_id, deezer_id, amazon_id, soundcloud_id, record_label, payout_method, paypal_email, bank_name, bank_account_name, bank_account_number, bank_country, mobile_money_provider, mobile_money_number, account_status"),
      ]);

      const profileMap: Record<string, ProfileRow> = {};
      for (const p of (profiles ?? []) as ProfileRow[]) profileMap[p.email] = p;

      const byEmail: Record<string, ReleaseRow[]> = {};
      for (const r of (releases ?? []) as ReleaseRow[]) {
        if (!byEmail[r.email]) byEmail[r.email] = [];
        byEmail[r.email].push(r);
      }

      const built: Artist[] = Object.entries(byEmail).map(([email, rows]) => {
        const prof = profileMap[email];
        const latest = rows[0];
        const totalStreams = rows.reduce((sum, r) => sum + Object.values(r.streams ?? {}).reduce((a, b) => a + b, 0), 0);
        const totalRoyalties = rows.reduce((sum, r) => sum + (r.royalties_usd ?? 0), 0);
        return {
          email,
          artist_name: prof?.artist_name || latest.artist_name,
          bio: prof?.bio ?? null,
          country: prof?.country || latest.country || null,
          genre: latest.genre,
          photo: prof?.artist_image_url ?? null,
          instagram_handle: prof?.instagram_handle ?? null,
          x_handle: prof?.x_handle ?? null,
          tiktok_username: prof?.tiktok_username ?? null,
          youtube_channel: prof?.youtube_channel ?? null,
          facebook_url: prof?.facebook_url ?? null,
          website_url: prof?.website_url ?? null,
          spotify_artist_id: prof?.spotify_artist_id ?? null,
          apple_music_artist_id: prof?.apple_music_artist_id ?? null,
          audiomack_id: prof?.audiomack_id ?? null,
          boomplay_id: prof?.boomplay_id ?? null,
          deezer_id: prof?.deezer_id ?? null,
          amazon_id: prof?.amazon_id ?? null,
          soundcloud_id: prof?.soundcloud_id ?? null,
          record_label: prof?.record_label ?? null,
          payout_method: prof?.payout_method ?? null,
          paypal_email: prof?.paypal_email ?? null,
          bank_name: prof?.bank_name ?? null,
          bank_account_name: prof?.bank_account_name ?? null,
          bank_account_number: prof?.bank_account_number ?? null,
          bank_country: prof?.bank_country ?? null,
          mobile_money_provider: prof?.mobile_money_provider ?? null,
          mobile_money_number: prof?.mobile_money_number ?? null,
          total_releases: rows.length,
          approved_releases: rows.filter((r) => r.status === "approved").length,
          total_streams: totalStreams,
          total_royalties: totalRoyalties,
          latest_status: latest.status,
          joined: rows[rows.length - 1].submitted_at,
          releases: rows,
          accountStatus: (prof?.account_status === "suspended" ? "suspended" : "active") as "active" | "suspended",
        };
      });

      built.sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime());
      setArtists(built);
      setLoading(false);
    }
    load();
  }, []);

  function handleSaved(email: string, updated: Partial<Artist>) {
    setArtists((prev) => prev.map((a) => (a.email === email ? { ...a, ...updated } : a)));
  }

  async function toggleStatus(email: string, current: "active" | "suspended") {
    const newStatus = current === "suspended" ? "active" : "suspended";
    setTogglingEmail(email);
    await supabase.from("artist_profiles").upsert({ email, account_status: newStatus }, { onConflict: "email" });
    setArtists((prev) => prev.map((a) => (a.email === email ? { ...a, accountStatus: newStatus } : a)));
    await supabase.from("notifications").insert({
      email,
      type: newStatus === "suspended" ? "warning" : "success",
      title: newStatus === "suspended" ? "Account Suspended" : "Account Reactivated",
      body: newStatus === "suspended"
        ? "Your OrinlabÍ Records account has been suspended. Please contact support for details."
        : "Your OrinlabÍ Records account has been reactivated. Welcome back!",
      link: "/portal",
    });
    setTogglingEmail(null);
  }

  const filtered = search.trim()
    ? artists.filter((a) => a.artist_name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()))
    : artists;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 size={28} className="text-[#007bff] animate-spin" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Artists",  value: artists.length },
          { label: "Active",         value: artists.filter((a) => a.accountStatus === "active").length,    color: "text-green-400" },
          { label: "Suspended",      value: artists.filter((a) => a.accountStatus === "suspended").length, color: "text-red-400" },
          { label: "Pending Review", value: artists.filter((a) => a.latest_status === "pending").length,   color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
            <p className={`font-bold text-2xl ${s.color ?? "text-white"}`}>{s.value}</p>
            <p className="text-white/40 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="search" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-4 py-3 rounded-xl transition-colors"
      />

      {/* Artist list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30 text-sm">No artists found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((artist) => {
            const cfg = statusCfg[artist.latest_status] ?? statusCfg.pending;
            const StatusIcon = cfg.icon;
            const isOpen = expanded === artist.email;
            const avatarSrc = artist.photo || artist.releases.find((r) => r.cover_art_url)?.cover_art_url || null;
            const isSuspended = artist.accountStatus === "suspended";
            const isToggling = togglingEmail === artist.email;

            return (
              <div key={artist.email} className={`border rounded-2xl p-5 transition-colors ${isSuspended ? "bg-red-500/[0.04] border-red-500/20" : "bg-white/[0.03] border-white/[0.06]"}`}>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`relative w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#007bff]/20 to-black ${isSuspended ? "opacity-50 grayscale" : ""}`}>
                    {avatarSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarSrc} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center"><Music2 size={20} className="text-[#007bff]/40" /></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-semibold text-sm ${isSuspended ? "text-white/50" : "text-white"}`}>{artist.artist_name}</p>
                          {isSuspended && <span className="text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">SUSPENDED</span>}
                          {artist.record_label && <span className="text-[10px] text-white/30 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full">{artist.record_label}</span>}
                        </div>
                        <p className="text-white/40 text-xs mt-0.5">{artist.email}</p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={12} />{cfg.label}
                        </div>
                        <button onClick={() => requestUnlock(() => toggleStatus(artist.email, artist.accountStatus))} disabled={isToggling}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border disabled:opacity-50 ${isSuspended ? "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"}`}>
                          {isToggling ? <Loader2 size={11} className="animate-spin" /> : isSuspended ? <><UserCheck size={12} /> Activate</> : <><UserX size={12} /> Suspend</>}
                        </button>
                        <button onClick={() => setExpanded(isOpen ? null : artist.email)}
                          className="flex items-center gap-1 text-white/40 hover:text-[#007bff] text-xs font-medium transition-colors px-2 py-1 rounded-lg hover:bg-[#007bff]/10">
                          {isOpen ? <><ChevronUp size={14} /> Close</> : <><ChevronDown size={14} /> Edit</>}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                      {artist.genre && <span className="text-white/30 text-xs">{artist.genre}</span>}
                      {artist.country && <span className="flex items-center gap-1 text-white/30 text-xs"><Globe size={11} />{artist.country}</span>}
                      <span className="text-white/30 text-xs">{artist.total_releases} release{artist.total_releases !== 1 ? "s" : ""}{artist.approved_releases > 0 && ` · ${artist.approved_releases} approved`}</span>
                      {artist.total_streams > 0 && <span className="flex items-center gap-1 text-white/30 text-xs"><TrendingUp size={10} />{fmtN(artist.total_streams)} streams</span>}
                      {artist.total_royalties > 0 && <span className="text-white/30 text-xs">${artist.total_royalties.toFixed(2)} royalties</span>}
                      {artist.payout_method && <span className="flex items-center gap-1 text-white/25 text-xs"><CreditCard size={10} />{artist.payout_method}</span>}
                      <span className="text-white/20 text-xs">Joined {new Date(artist.joined).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                    </div>

                    {/* Social / DSP chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {artist.instagram_handle && <a href={`https://instagram.com/${artist.instagram_handle.replace("@","")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-pink-400/70 bg-pink-400/[0.07] border border-pink-400/10 px-2 py-0.5 rounded-full hover:text-pink-400 transition-colors">IG</a>}
                      {artist.spotify_artist_id && <span className="flex items-center gap-1 text-[10px] text-green-400/70 bg-green-400/[0.07] border border-green-400/10 px-2 py-0.5 rounded-full">Spotify</span>}
                      {artist.x_handle && <span className="flex items-center gap-1 text-[10px] text-white/40 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">X</span>}
                      {artist.tiktok_username && <span className="flex items-center gap-1 text-[10px] text-white/40 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full">TikTok</span>}
                    </div>

                    {artist.bio && <p className="text-white/40 text-xs mt-2 line-clamp-2 leading-relaxed">{artist.bio}</p>}
                  </div>
                </div>

                {/* Edit panel — available to all admins */}
                {isOpen && (
                  <EditPanel artist={artist} onSaved={(updated) => handleSaved(artist.email, updated)} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
