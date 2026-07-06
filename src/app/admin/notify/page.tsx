"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Send, Search, CheckSquare, Square, Loader2, CheckCircle2,
  Users, Globe, BarChart2, DollarSign, Music2, AlertTriangle,
  Radio, CreditCard, FileText, MessageSquare, Zap, TrendingUp,
  Info, ChevronDown, ChevronUp, X,
} from "lucide-react";

// ─── Notification templates ───────────────────────────────────────────────────

type FieldDef = {
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "number" | "textarea" | "select";
  options?: string[];
  required?: boolean;
};

type Template = {
  id: string;
  label: string;
  icon: React.ElementType;
  iconColor: string;
  description: string;
  notifType: "info" | "success" | "warning" | "error";
  fields: FieldDef[];
  buildTitle: (f: Record<string, string>) => string;
  buildBody: (f: Record<string, string>) => string;
  categoryLabel: string;
  ctaLabel: string;
  ctaPath: string;
};

const ARTIST_TEMPLATES: Template[] = [
  {
    id: "streams_update",
    label: "Streams Update",
    icon: BarChart2,
    iconColor: "#007bff",
    description: "Report stream counts from a DSP",
    notifType: "info",
    categoryLabel: "Streams Report",
    ctaLabel: "View Earnings",
    ctaPath: "/portal/earnings",
    fields: [
      { name: "song_title",   label: "Song Title",  placeholder: "e.g. Afrobeats Night",    type: "text",   required: true },
      { name: "platform",     label: "Platform",    placeholder: "e.g. Spotify",             type: "text",   required: true },
      { name: "stream_count", label: "Streams",     placeholder: "e.g. 12,500",              type: "text",   required: true },
      { name: "period",       label: "Period",      placeholder: "e.g. this week / May 2026", type: "text",  required: true },
    ],
    buildTitle: (f) => `Streams Update — ${f.song_title}`,
    buildBody:  (f) => `Your track "${f.song_title}" received ${f.stream_count} streams on ${f.platform} ${f.period}. Keep creating and promoting to grow your numbers.`,
  },
  {
    id: "royalty_available",
    label: "Royalties Available",
    icon: DollarSign,
    iconColor: "#10B981",
    description: "Notify artist that royalties are ready",
    notifType: "success",
    categoryLabel: "Royalty Update",
    ctaLabel: "Request Payout",
    ctaPath: "/portal/earnings",
    fields: [
      { name: "song_title", label: "Song Title", placeholder: "e.g. Afrobeats Night", type: "text", required: true },
      { name: "amount",     label: "Amount (USD)", placeholder: "e.g. 45.20",         type: "text", required: true },
    ],
    buildTitle: (f) => `Royalties Available — $${f.amount}`,
    buildBody:  (f) => `Your royalties of $${f.amount} from "${f.song_title}" are now available. You can request a payout from your portal at any time.`,
  },
  {
    id: "release_approved",
    label: "Release Approved",
    icon: CheckCircle2,
    iconColor: "#10B981",
    description: "Tell artist their release passed review",
    notifType: "success",
    categoryLabel: "Release Approved",
    ctaLabel: "View Release",
    ctaPath: "/portal",
    fields: [
      { name: "song_title", label: "Song Title", placeholder: "e.g. Afrobeats Night", type: "text", required: true },
    ],
    buildTitle: (f) => `Release Approved — ${f.song_title}`,
    buildBody:  (f) => `Great news! Your release "${f.song_title}" has been approved and is now being prepared for distribution across all your selected platforms.`,
  },
  {
    id: "release_live",
    label: "Release Live",
    icon: Zap,
    iconColor: "#8B5CF6",
    description: "Confirm that release is now streaming",
    notifType: "success",
    categoryLabel: "You're Live",
    ctaLabel: "View Smart Link",
    ctaPath: "/portal",
    fields: [
      { name: "song_title", label: "Song Title", placeholder: "e.g. Afrobeats Night",         type: "text", required: true },
      { name: "platforms",  label: "Platforms",  placeholder: "e.g. Spotify, Apple Music, Boomplay", type: "text", required: true },
    ],
    buildTitle: (f) => `You're Live! — ${f.song_title}`,
    buildBody:  (f) => `Your release "${f.song_title}" is now live on ${f.platforms}. Share your smart link with fans and start tracking your streams in the earnings section.`,
  },
  {
    id: "release_rejected",
    label: "Release Needs Attention",
    icon: AlertTriangle,
    iconColor: "#F59E0B",
    description: "Inform artist of rejection with reason",
    notifType: "warning",
    categoryLabel: "Action Required",
    ctaLabel: "Resubmit Release",
    ctaPath: "/portal/releases/new",
    fields: [
      { name: "song_title", label: "Song Title",   placeholder: "e.g. Afrobeats Night",      type: "text",     required: true },
      { name: "reason",     label: "Reason",       placeholder: "e.g. Artwork is too small", type: "textarea", required: true },
    ],
    buildTitle: (f) => `Action Needed — ${f.song_title}`,
    buildBody:  (f) => `Your release "${f.song_title}" requires attention before it can be distributed.\n\nReason: ${f.reason}\n\nPlease make the necessary corrections and resubmit.`,
  },
  {
    id: "platform_issue",
    label: "Platform Issue",
    icon: AlertTriangle,
    iconColor: "#F43F5E",
    description: "Report a DSP-specific issue",
    notifType: "warning",
    categoryLabel: "Platform Issue",
    ctaLabel: "View Release",
    ctaPath: "/portal",
    fields: [
      { name: "song_title", label: "Song Title", placeholder: "e.g. Afrobeats Night", type: "text",     required: true },
      { name: "platform",   label: "Platform",   placeholder: "e.g. Spotify",         type: "text",     required: true },
      { name: "issue",      label: "Issue",      placeholder: "Describe the issue",    type: "textarea", required: true },
    ],
    buildTitle: (f) => `Platform Issue — ${f.song_title} on ${f.platform}`,
    buildBody:  (f) => `There is an issue with "${f.song_title}" on ${f.platform}.\n\n${f.issue}\n\nOur team is working to resolve this. You will be notified once it's fixed.`,
  },
  {
    id: "pitch_result",
    label: "Pitch Result",
    icon: Radio,
    iconColor: "#8B5CF6",
    description: "Playlist or radio pitch decision",
    notifType: "info",
    categoryLabel: "Pitch Result",
    ctaLabel: "Submit Another Pitch",
    ctaPath: "/portal/pitch",
    fields: [
      { name: "song_title",    label: "Song Title",    placeholder: "e.g. Afrobeats Night",       type: "text",   required: true },
      { name: "result",        label: "Result",        placeholder: "",                             type: "select", options: ["Accepted", "Reviewed", "Not Selected"], required: true },
      { name: "playlist_name", label: "Playlist/Show", placeholder: "e.g. African Heat Playlist",  type: "text" },
    ],
    buildTitle: (f) => `Pitch ${f.result} — ${f.song_title}`,
    buildBody:  (f) => {
      const target = f.playlist_name ? ` for "${f.playlist_name}"` : "";
      if (f.result === "Accepted") return `Congratulations! Your playlist pitch for "${f.song_title}" has been accepted${target}. Your track will be featured soon.`;
      if (f.result === "Reviewed") return `Your playlist pitch for "${f.song_title}"${target} has been reviewed. While it wasn't selected this time, keep pitching — curators have taken note of your music.`;
      return `Your playlist pitch for "${f.song_title}"${target} was not selected this time. Don't give up — submit your next release and keep pitching!`;
    },
  },
  {
    id: "payout_sent",
    label: "Payout Sent",
    icon: CreditCard,
    iconColor: "#10B981",
    description: "Confirm payment has been dispatched",
    notifType: "success",
    categoryLabel: "Payment Sent",
    ctaLabel: "View Earnings",
    ctaPath: "/portal/earnings",
    fields: [
      { name: "amount",  label: "Amount (USD)",    placeholder: "e.g. 45.20",       type: "text", required: true },
      { name: "method",  label: "Payment Method",  placeholder: "e.g. Bank Transfer / PayPal", type: "text", required: true },
    ],
    buildTitle: (f) => `Payout Sent — $${f.amount}`,
    buildBody:  (f) => `Your payout of $${f.amount} has been sent via ${f.method}. Please allow 3–5 business days for the funds to arrive. Check your earnings page for a full history.`,
  },
  {
    id: "monthly_report",
    label: "Monthly Report",
    icon: TrendingUp,
    iconColor: "#007bff",
    description: "Monthly stats summary from your DSP reports",
    notifType: "info",
    categoryLabel: "Monthly Report",
    ctaLabel: "View Earnings",
    ctaPath: "/portal/earnings",
    fields: [
      { name: "month",        label: "Month",          placeholder: "e.g. May 2026",  type: "text", required: true },
      { name: "stream_count", label: "Total Streams",  placeholder: "e.g. 38,000",   type: "text", required: true },
      { name: "earnings",     label: "Earnings (USD)", placeholder: "e.g. 120.50",   type: "text", required: true },
    ],
    buildTitle: (f) => `Your ${f.month} Report`,
    buildBody:  (f) => `Here's your music summary for ${f.month}:\n\n• Total Streams: ${f.stream_count}\n• Royalties Earned: $${f.earnings}\n\nKeep distributing and promoting — every stream adds up!`,
  },
  {
    id: "isrc_assigned",
    label: "ISRC / UPC Assigned",
    icon: Music2,
    iconColor: "#007bff",
    description: "Share an ISRC or UPC code with the artist",
    notifType: "info",
    categoryLabel: "Code Assigned",
    ctaLabel: "View Release",
    ctaPath: "/portal",
    fields: [
      { name: "song_title", label: "Song Title",     placeholder: "e.g. Afrobeats Night",     type: "text",   required: true },
      { name: "code_type",  label: "Code Type",      placeholder: "",                          type: "select", options: ["ISRC", "UPC"], required: true },
      { name: "code_value", label: "Code",           placeholder: "e.g. GBUM72000001",         type: "text",   required: true },
    ],
    buildTitle: (f) => `${f.code_type} Assigned — ${f.song_title}`,
    buildBody:  (f) => `Your ${f.code_type} code for "${f.song_title}" is:\n\n${f.code_value}\n\nKeep this for your records — you'll need it for future releases and licensing deals.`,
  },
  {
    id: "action_required",
    label: "Action Required",
    icon: FileText,
    iconColor: "#F59E0B",
    description: "Ask artist to complete a specific task",
    notifType: "warning",
    categoryLabel: "Action Required",
    ctaLabel: "Go to Portal",
    ctaPath: "/portal",
    fields: [
      { name: "action",   label: "What needs to be done", placeholder: "e.g. Upload your signed contract",          type: "textarea", required: true },
      { name: "deadline", label: "Deadline (optional)",    placeholder: "e.g. by 30 June 2026",                      type: "text" },
    ],
    buildTitle: (f) => "Action Required",
    buildBody:  (f) => `${f.action}${f.deadline ? `\n\nPlease complete this by ${f.deadline}.` : ""}`,
  },
  {
    id: "custom_artist",
    label: "Custom Message",
    icon: MessageSquare,
    iconColor: "#8B5CF6",
    description: "Write a completely custom notification",
    notifType: "info",
    categoryLabel: "Message from OrinlabÍ Records",
    ctaLabel: "View in Portal",
    ctaPath: "/portal",
    fields: [
      { name: "custom_type",  label: "Type",  placeholder: "", type: "select", options: ["info", "success", "warning", "error"], required: true },
      { name: "title",        label: "Title", placeholder: "Notification title",  type: "text",     required: true },
      { name: "body",         label: "Body",  placeholder: "Notification body...", type: "textarea", required: true },
    ],
    buildTitle: (f) => f.title,
    buildBody:  (f) => f.body,
  },
];

const LABEL_TEMPLATES: Template[] = [
  {
    id: "label_approved",
    label: "Application Approved",
    icon: CheckCircle2,
    iconColor: "#10B981",
    description: "Welcome the label to OrinlabÍ Records",
    notifType: "success",
    categoryLabel: "Welcome to OrinlabÍ Records",
    ctaLabel: "Go to Label Portal",
    ctaPath: "/labels/portal",
    fields: [],
    buildTitle: (_f) => "Your Label Application is Approved",
    buildBody:  (_f) => "Congratulations! Your label has been approved on OrinlabÍ Records. You can now access your label portal, manage your roster, and distribute music on behalf of your artists.",
  },
  {
    id: "label_roster",
    label: "Roster Update",
    icon: Users,
    iconColor: "#007bff",
    description: "Notify label about artist roster change",
    notifType: "info",
    categoryLabel: "Roster Update",
    ctaLabel: "View Roster",
    ctaPath: "/labels/portal",
    fields: [
      { name: "artist_name", label: "Artist Name", placeholder: "e.g. Kemi Ade",            type: "text",   required: true },
      { name: "action",      label: "Action",      placeholder: "",                           type: "select", options: ["Added to your roster", "Removed from your roster", "Activated", "Suspended"], required: true },
    ],
    buildTitle: (f) => `Roster Update — ${f.artist_name}`,
    buildBody:  (f) => `Artist ${f.artist_name} has been ${f.action}. Log in to your label portal to view your updated roster.`,
  },
  {
    id: "label_earnings",
    label: "Label Earnings",
    icon: DollarSign,
    iconColor: "#10B981",
    description: "Send monthly label earnings summary",
    notifType: "success",
    categoryLabel: "Earnings Summary",
    ctaLabel: "View Label Portal",
    ctaPath: "/labels/portal",
    fields: [
      { name: "month",    label: "Month",          placeholder: "e.g. May 2026",  type: "text", required: true },
      { name: "earnings", label: "Earnings (USD)", placeholder: "e.g. 320.00",   type: "text", required: true },
      { name: "artists",  label: "Active Artists", placeholder: "e.g. 4",        type: "text" },
    ],
    buildTitle: (f) => `Label Earnings — ${f.month}`,
    buildBody:  (f) => `Your label earned $${f.earnings} in royalties for ${f.month}${f.artists ? ` across ${f.artists} active artists` : ""}. Log in to your portal to see the full breakdown.`,
  },
  {
    id: "label_action",
    label: "Action Required",
    icon: FileText,
    iconColor: "#F59E0B",
    description: "Ask label to complete a specific task",
    notifType: "warning",
    categoryLabel: "Action Required",
    ctaLabel: "Go to Label Portal",
    ctaPath: "/labels/portal",
    fields: [
      { name: "action",   label: "What needs to be done", placeholder: "e.g. Update your label profile",  type: "textarea", required: true },
      { name: "deadline", label: "Deadline (optional)",   placeholder: "e.g. by 30 June 2026",            type: "text" },
    ],
    buildTitle: (_f) => "Action Required",
    buildBody:  (f) => `${f.action}${f.deadline ? `\n\nPlease complete this by ${f.deadline}.` : ""}`,
  },
  {
    id: "custom_label",
    label: "Custom Message",
    icon: MessageSquare,
    iconColor: "#8B5CF6",
    description: "Write a completely custom notification",
    notifType: "info",
    categoryLabel: "Message from OrinlabÍ Records",
    ctaLabel: "Go to Label Portal",
    ctaPath: "/labels/portal",
    fields: [
      { name: "custom_type", label: "Type",  placeholder: "", type: "select", options: ["info", "success", "warning", "error"], required: true },
      { name: "title",       label: "Title", placeholder: "Notification title",   type: "text",     required: true },
      { name: "body",        label: "Body",  placeholder: "Notification body...", type: "textarea",  required: true },
    ],
    buildTitle: (f) => f.title,
    buildBody:  (f) => f.body,
  },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

type Artist = { id: string; email: string; artist_name: string | null; artist_image_url: string | null; country: string | null };
type Label  = { id: string; email: string; name: string | null; logo_url: string | null; country: string | null };

type SendResult = { sent: number; failed: number; total: number };

// ─── Initials avatar ───────────────────────────────────────────────────────────

function Avatar({ name, image, color }: { name: string; image: string | null; color: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  if (image) return <img src={image} alt="" className="w-full h-full object-cover" />;
  return (
    <div className="w-full h-full flex items-center justify-center text-white font-bold text-[11px]"
      style={{ background: color }}>
      {initials || "?"}
    </div>
  );
}

// ─── Notification type badge ───────────────────────────────────────────────────

const TYPE_STYLES = {
  info:    { color: "#007bff",  bg: "rgba(0,123,255,0.12)",    label: "Info" },
  success: { color: "#10B981",  bg: "rgba(16,185,129,0.12)",   label: "Success" },
  warning: { color: "#F59E0B",  bg: "rgba(245,158,11,0.12)",   label: "Action" },
  error:   { color: "#F43F5E",  bg: "rgba(244,63,94,0.12)",    label: "Important" },
};

// ─── Main page ────────────────────────────────────────────────────────────────

type DeliveryMode = "both" | "inapp" | "email";

export default function NotifyPage() {
  const [recipientType, setRecipientType] = useState<"artists" | "labels">("artists");
  const [artists, setArtists]   = useState<Artist[]>([]);
  const [labels, setLabels]     = useState<Label[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [templateId, setTemplateId]   = useState<string>("");
  const [fields, setFields]           = useState<Record<string, string>>({});
  const [sending, setSending]         = useState(false);
  const [result, setResult]           = useState<SendResult | null>(null);
  const [error, setError]             = useState("");
  const [showTemplates, setShowTemplates] = useState(true);
  const [sentHistory, setSentHistory] = useState<{ title: string; count: number; time: string }[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("both");
  const [reminderPin, setReminderPin]     = useState("");
  const [reminderRunning, setReminderRunning] = useState(false);
  const [reminderResult, setReminderResult] = useState<{ artistsHit: number; totalNotificationsInserted: number; totalEmailsSent: number } | null>(null);
  const [reminderError, setReminderError] = useState("");

  useEffect(() => {
    async function load() {
      const [{ data: a }, { data: l }] = await Promise.all([
        supabase.from("artist_profiles").select("id,email,artist_name,artist_image_url,country").not("email", "is", null).order("artist_name"),
        supabase.from("label_profiles").select("id,email,name,logo_url,country").not("email", "is", null).order("name"),
      ]);
      setArtists((a ?? []) as Artist[]);
      setLabels((l ?? []) as Label[]);
      setLoading(false);
    }
    load();
  }, []);

  const templates = recipientType === "artists" ? ARTIST_TEMPLATES : LABEL_TEMPLATES;
  const activeTemplate = templates.find((t) => t.id === templateId) ?? null;

  // Reset selection and template when switching recipient type
  function switchType(type: "artists" | "labels") {
    setRecipientType(type);
    setSelected(new Set());
    setTemplateId("");
    setFields({});
    setResult(null);
    setError("");
  }

  // The list being shown
  const allRecipients: { id: string; email: string; name: string; image: string | null; country: string | null }[] =
    recipientType === "artists"
      ? artists.map((a) => ({ id: a.id, email: a.email, name: a.artist_name ?? a.email, image: a.artist_image_url, country: a.country }))
      : labels.map((l)  => ({ id: l.id, email: l.email, name: l.name ?? l.email,         image: l.logo_url,          country: l.country }));

  const filtered = useMemo(() =>
    search.trim()
      ? allRecipients.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()))
      : allRecipients,
    [allRecipients, search]
  );

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.email));

  function toggleOne(email: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email); else next.add(email);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => { const n = new Set(prev); filtered.forEach((r) => n.delete(r.email)); return n; });
    } else {
      setSelected((prev) => { const n = new Set(prev); filtered.forEach((r) => n.add(r.email)); return n; });
    }
  }

  function selectTemplate(id: string) {
    setTemplateId(id);
    setFields({});
    setResult(null);
    setError("");
    setShowTemplates(false);
  }

  // Compute the live notification preview
  const previewTitle = useMemo(() => {
    if (!activeTemplate) return "";
    try { return activeTemplate.buildTitle(fields); } catch { return ""; }
  }, [activeTemplate, fields]);

  const previewBody = useMemo(() => {
    if (!activeTemplate) return "";
    try { return activeTemplate.buildBody(fields); } catch { return ""; }
  }, [activeTemplate, fields]);

  const notifType = useMemo(() => {
    if (activeTemplate?.id === "custom_artist" || activeTemplate?.id === "custom_label") {
      return (fields.custom_type as "info" | "success" | "warning" | "error") ?? "info";
    }
    return activeTemplate?.notifType ?? "info";
  }, [activeTemplate, fields]);

  const selectedRecipients = allRecipients.filter((r) => selected.has(r.email));

  async function handleSend() {
    if (!activeTemplate || selected.size === 0) return;
    setError("");

    // Validate required fields
    for (const f of activeTemplate.fields.filter((f) => f.required)) {
      if (!fields[f.name]?.trim()) {
        setError(`Please fill in "${f.label}".`);
        return;
      }
    }

    const portalBase = recipientType === "artists" ? "https://orinlabi.com" : "https://orinlabi.com";
    const ctaPath = activeTemplate.ctaPath;

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          recipients: selectedRecipients.map((r) => ({
            email: r.email,
            name: r.name,
            portalUrl: `${portalBase}${ctaPath}`,
          })),
          notification: {
            title: previewTitle,
            body: previewBody,
            type: notifType,
            categoryLabel: activeTemplate.categoryLabel,
            ctaLabel: activeTemplate.ctaLabel,
            ctaUrl: `${portalBase}${ctaPath}`,
          },
          deliveryMode,
        }),
      });
      const data = await res.json();
      setResult({ sent: data.emailsSent ?? 0, failed: data.emailsFailed?.length ?? 0, total: data.total ?? 0 });
      setSentHistory((prev) => [
        { title: previewTitle, count: selectedRecipients.length, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9),
      ]);
      setSelected(new Set());
      setFields({});
      setTemplateId("");
      setShowTemplates(true);
    } catch {
      setError("Failed to send. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  async function runReminders() {
    if (!reminderPin.trim()) { setReminderError("Enter your admin PIN."); return; }
    setReminderRunning(true);
    setReminderError("");
    setReminderResult(null);
    try {
      const res = await fetch("/api/admin/profile-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: reminderPin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setReminderResult(data);
      setReminderPin("");
    } catch (e) {
      setReminderError(e instanceof Error ? e.message : "Failed to run reminders.");
    } finally {
      setReminderRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  const typeStyle = TYPE_STYLES[notifType] ?? TYPE_STYLES.info;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white font-bold text-2xl">Notify Artists & Labels</h1>
        <p className="text-white/40 text-sm mt-1">
          Send targeted updates from your Ditto dashboard or write custom messages — no coding required.
        </p>
      </div>

      {/* ── Automated Reminders ────────────────────────────────────────── */}
      <div className="mb-8 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-white font-semibold text-sm flex items-center gap-2">
              <Zap size={15} className="text-[#007bff]" /> Automated Reminders
            </p>
            <p className="text-white/40 text-xs mt-1">
              Checks every approved artist and sends targeted in-app notifications + emails for: incomplete profiles, missing payout details, live releases with no streaming links, and releases missing lyrics.
            </p>
          </div>
        </div>
        {reminderResult && (
          <div className="mb-4 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3 text-sm">
            <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
            <span className="text-white/80">
              Done — <strong className="text-white">{reminderResult.artistsHit}</strong> artists had gaps ·{" "}
              <strong className="text-white">{reminderResult.totalNotificationsInserted}</strong> notifications inserted ·{" "}
              <strong className="text-white">{reminderResult.totalEmailsSent}</strong> emails sent
            </span>
            <button onClick={() => setReminderResult(null)} className="ml-auto text-white/30 hover:text-white/60"><X size={13} /></button>
          </div>
        )}
        {reminderError && (
          <div className="mb-4 flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3 text-sm text-rose-400">
            <AlertTriangle size={14} className="flex-shrink-0" /> {reminderError}
          </div>
        )}
        <div className="flex items-center gap-3">
          <input
            type="password"
            placeholder="Admin PIN"
            value={reminderPin}
            onChange={(e) => setReminderPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runReminders()}
            className="bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-3 py-2 rounded-xl transition-colors w-36"
          />
          <button
            onClick={runReminders}
            disabled={reminderRunning}
            className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            {reminderRunning ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {reminderRunning ? "Running…" : "Send All Reminders"}
          </button>
        </div>
      </div>

      {/* Success result */}
      {result && (
        <div className="mb-6 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl px-5 py-4">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Notification sent successfully</p>
            <p className="text-white/50 text-xs mt-0.5">{result.sent} email{result.sent !== 1 ? "s" : ""} sent · {result.total} in-app notifications created{result.failed > 0 ? ` · ${result.failed} failed` : ""}</p>
          </div>
          <button onClick={() => setResult(null)} className="text-white/30 hover:text-white/60 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-rose-500/10 border border-rose-500/25 rounded-2xl px-5 py-4">
          <AlertTriangle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-white/80 text-sm">{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-white/30 hover:text-white/60 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

        {/* ── Left: Recipient selector ──────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Type tabs */}
          <div className="flex bg-white/[0.04] rounded-xl p-1 gap-1">
            {(["artists", "labels"] as const).map((type) => (
              <button
                key={type}
                onClick={() => switchType(type)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                  recipientType === type ? "bg-[#007bff] text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                {type === "artists" ? <Users size={15} /> : <Globe size={15} />}
                {type === "artists" ? `Artists (${artists.length})` : `Labels (${labels.length})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${recipientType}…`}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/25 outline-none focus:border-[#007bff]/50 transition-colors"
            />
          </div>

          {/* Select all + Send ALL quick action */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white transition-colors"
            >
              {allSelected ? <CheckSquare size={14} className="text-[#007bff]" /> : <Square size={14} />}
              {allSelected ? "Deselect All" : `Select All (${filtered.length})`}
            </button>
            {selected.size > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#007bff]/15 text-[#007bff]">
                {selected.size} selected
              </span>
            )}
          </div>

          {/* Quick "send to everyone" pill */}
          {!allSelected && filtered.length > 0 && (
            <button
              onClick={() => setSelected(new Set(allRecipients.map((r) => r.email)))}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-[#007bff]/30 text-[#007bff] text-xs font-semibold hover:bg-[#007bff]/10 transition-all"
            >
              <Users size={13} />
              Send to ALL {recipientType} ({allRecipients.length})
            </button>
          )}

          {/* Recipient list */}
          <div className="flex-1 overflow-y-auto max-h-[480px] space-y-1 pr-1" style={{ scrollbarWidth: "thin" }}>
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">No {recipientType} found</div>
            ) : filtered.map((r, i) => {
              const isSelected = selected.has(r.email);
              const colors = ["linear-gradient(135deg,#007bff,#8B5CF6)", "linear-gradient(135deg,#10B981,#007bff)", "linear-gradient(135deg,#F59E0B,#EF4444)", "linear-gradient(135deg,#8B5CF6,#EC4899)"];
              const color = colors[i % colors.length];
              return (
                <button
                  key={r.email}
                  onClick={() => toggleOne(r.email)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                    isSelected ? "bg-[#007bff]/10 border border-[#007bff]/25" : "bg-white/[0.03] border border-transparent hover:bg-white/[0.05]"
                  }`}
                >
                  <div className={`flex-shrink-0 w-4 h-4 rounded transition-colors ${isSelected ? "text-[#007bff]" : "text-white/20"}`}>
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
                  <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
                    <Avatar name={r.name} image={r.image} color={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{r.name}</p>
                    <p className="text-white/30 text-[11px] truncate">{r.email}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: Compose ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Template picker */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              onClick={() => setShowTemplates((v) => !v)}
            >
              <div>
                <p className="text-white font-semibold text-sm">
                  {activeTemplate ? activeTemplate.label : "Choose Notification Type"}
                </p>
                {activeTemplate && (
                  <p className="text-white/40 text-xs mt-0.5">{activeTemplate.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeTemplate && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: activeTemplate.iconColor + "22" }}>
                    <activeTemplate.icon size={14} style={{ color: activeTemplate.iconColor }} />
                  </div>
                )}
                {showTemplates ? <ChevronUp size={15} className="text-white/40" /> : <ChevronDown size={15} className="text-white/40" />}
              </div>
            </button>

            {showTemplates && (
              <div className="px-5 pb-5 border-t border-white/[0.05]">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                  {templates.map((t) => {
                    const active = templateId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => selectTemplate(t.id)}
                        className={`flex flex-col items-start gap-1.5 px-3 py-3 rounded-xl border text-left transition-all ${
                          active
                            ? "border-[#007bff]/40 bg-[#007bff]/10"
                            : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: t.iconColor + "22" }}>
                          <t.icon size={13} style={{ color: t.iconColor }} />
                        </div>
                        <p className="text-white text-xs font-semibold leading-tight">{t.label}</p>
                        <p className="text-white/30 text-[10px] leading-tight line-clamp-2">{t.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Fields */}
          {activeTemplate && activeTemplate.fields.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">Fill in Details</p>
              <div className="space-y-4">
                {activeTemplate.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-white/50 text-xs font-medium mb-1.5">
                      {field.label} {field.required && <span className="text-rose-400">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={fields[field.name] ?? ""}
                        onChange={(e) => setFields((f) => ({ ...f, [field.name]: e.target.value }))}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff]/50 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-white/25 outline-none transition-colors resize-none"
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={fields[field.name] ?? ""}
                        onChange={(e) => setFields((f) => ({ ...f, [field.name]: e.target.value }))}
                        className="w-full bg-[#0a0a0a] border border-white/[0.08] focus:border-[#007bff]/50 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none transition-colors appearance-none"
                      >
                        <option value="">Select…</option>
                        {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={fields[field.name] ?? ""}
                        onChange={(e) => setFields((f) => ({ ...f, [field.name]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff]/50 rounded-xl px-3.5 py-2.5 text-white text-sm placeholder-white/25 outline-none transition-colors"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {activeTemplate && previewTitle && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">Preview</p>
              <div className="space-y-3">
                {/* In-app notification preview */}
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">In-App Notification</p>
                  <div
                    className="rounded-xl p-4 border"
                    style={{ background: typeStyle.bg, borderColor: typeStyle.color + "40" }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: typeStyle.color }} />
                      <div>
                        <p className="text-white font-semibold text-sm">{previewTitle}</p>
                        <p className="text-white/60 text-xs mt-1 leading-relaxed whitespace-pre-line line-clamp-4">{previewBody}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email preview */}
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Email Subject</p>
                  <div className="bg-white/[0.04] rounded-xl px-4 py-3">
                    <p className="text-white/70 text-sm font-mono">{previewTitle} — OrinlabÍ Records</p>
                  </div>
                </div>

                {/* Recipients summary */}
                {selected.size > 0 && (
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Recipients ({selected.size})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRecipients.slice(0, 8).map((r) => (
                        <span key={r.email} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.06] text-white/60">
                          {r.name}
                        </span>
                      ))}
                      {selected.size > 8 && (
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.04] text-white/30">
                          +{selected.size - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery mode */}
          {activeTemplate && (
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Delivery Mode</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "both",  label: "Both",       desc: "In-app + Email" },
                  { id: "inapp", label: "In-app Only", desc: "Portal only"    },
                  { id: "email", label: "Email Only",  desc: "No portal notif" },
                ] as { id: DeliveryMode; label: string; desc: string }[]).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setDeliveryMode(m.id)}
                    className={`flex flex-col items-center px-3 py-2.5 rounded-xl border text-center transition-all ${
                      deliveryMode === m.id
                        ? "border-[#007bff]/40 bg-[#007bff]/10 text-[#007bff]"
                        : "border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <p className="text-xs font-semibold">{m.label}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Send button */}
          {activeTemplate && (
            <button
              onClick={handleSend}
              disabled={selected.size === 0 || sending || !previewTitle}
              className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: selected.size > 0 && previewTitle ? "linear-gradient(135deg, #007bff, #8B5CF6)" : "rgba(255,255,255,0.06)" }}
            >
              {sending
                ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
                : <><Send size={16} /> Send to {selected.size > 0 ? `${selected.size} ${recipientType}` : `selected ${recipientType}`}</>}
            </button>
          )}

          {/* No recipient warning */}
          {activeTemplate && selected.size === 0 && (
            <p className="text-center text-white/30 text-xs -mt-2">
              ← Select at least one {recipientType === "artists" ? "artist" : "label"} from the left to enable sending
            </p>
          )}
        </div>
      </div>

      {/* Recent sends history */}
      {sentHistory.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Sent This Session</p>
          <div className="space-y-2">
            {sentHistory.map((h, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.02] rounded-xl px-4 py-3">
                <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs font-medium truncate">{h.title}</p>
                  <p className="text-white/30 text-[11px]">Sent to {h.count} recipient{h.count !== 1 ? "s" : ""}</p>
                </div>
                <span className="text-white/20 text-[11px] flex-shrink-0">{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Info, color: "#007bff", title: "In-app + Email", body: "Every notification appears in the artist portal AND sends an email — no extra steps needed." },
          { icon: Zap,  color: "#8B5CF6", title: "Real-time delivery", body: "In-app notifications appear instantly. Emails arrive within 1–2 minutes." },
          { icon: Users, color: "#10B981", title: "Multi-select", body: "Select multiple artists or labels to send the same update to all of them at once." },
        ].map(({ icon: Icon, color, title, body }) => (
          <div key={title} className="flex items-start gap-3 bg-white/[0.02] rounded-xl px-4 py-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: color + "20" }}>
              <Icon size={13} style={{ color }} />
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold">{title}</p>
              <p className="text-white/30 text-[11px] mt-0.5 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
