export type Platform = {
  key: string;
  label: string;
  color: string;
};

export const ALL_PLATFORMS: Platform[] = [
  // ── Major streaming DSPs ──────────────────────────────────────
  { key: "spotify",              label: "Spotify",              color: "#1DB954" },
  { key: "apple_music",          label: "Apple Music",          color: "#FC3C44" },
  { key: "itunes",               label: "iTunes",               color: "#FC3C44" },
  { key: "youtube_music",        label: "YouTube Music",        color: "#FF0000" },
  { key: "amazon_music",         label: "Amazon Music",         color: "#00A8E1" },
  { key: "deezer",               label: "Deezer",               color: "#A238FF" },
  { key: "tidal",                label: "TIDAL",                color: "#00FFFF" },
  { key: "pandora",              label: "Pandora",              color: "#3668FF" },
  { key: "audiomack",            label: "Audiomack",            color: "#FFA500" },
  { key: "boomplay",             label: "Boomplay",             color: "#FF6B35" },
  { key: "soundcloud",           label: "SoundCloud",           color: "#FF5500" },
  { key: "anghami",              label: "Anghami",              color: "#9B59B6" },
  { key: "napster",              label: "Napster",              color: "#009ACD" },
  { key: "iheartradio",          label: "iHeartRadio",          color: "#C6002B" },
  { key: "shazam",               label: "Shazam",               color: "#0088FF" },
  { key: "beatport",             label: "Beatport",             color: "#00FF95" },
  { key: "jio_saavn",            label: "JioSaavn",             color: "#2BC5B4" },
  { key: "gaana",                label: "Gaana",                color: "#E72429" },
  { key: "wynk",                 label: "Wynk Music",           color: "#00B3E3" },
  { key: "kkbox",                label: "KKBOX",                color: "#00C4CC" },
  { key: "claro_musica",         label: "Claro Música",         color: "#FF6600" },
  { key: "7digital",             label: "7digital",             color: "#EA002A" },
  { key: "mixcloud",             label: "Mixcloud",             color: "#52AAD8" },
  { key: "joox",                 label: "Joox",                 color: "#00C853" },
  { key: "awa",                  label: "AWA Music",            color: "#FF6B00" },
  { key: "qq_music",             label: "QQ Music",             color: "#FFD700" },
  { key: "kugou",                label: "Kugou",                color: "#1A73E8" },
  { key: "kuwo",                 label: "Kuwo",                 color: "#FF4444" },
  { key: "netease",              label: "NetEase Cloud Music",  color: "#E60026" },
  { key: "liveone",              label: "LiveOne",              color: "#FF3B30" },
  { key: "lola_music",           label: "Lola Music",           color: "#FF1493" },
  { key: "movistar",             label: "Movistar Música",      color: "#009DD4" },
  { key: "ayoba",                label: "Ayoba",                color: "#00BCD4" },
  { key: "flo",                  label: "Flo",                  color: "#FFD600" },
  { key: "peloton",              label: "Peloton",              color: "#FF1D25" },
  { key: "roxi",                 label: "ROXi",                 color: "#E63946" },
  { key: "stationhead",          label: "Stationhead",          color: "#FF4F5A" },
  { key: "lissen",               label: "Lissen",               color: "#FF6B6B" },
  { key: "wesing",               label: "WeSing",               color: "#07C160" },
  { key: "taobao",               label: "Taobao",               color: "#FF6B00" },
  // ── Social & Short video ──────────────────────────────────────
  { key: "tiktok",               label: "TikTok",               color: "#69C9D0" },
  { key: "tiktok_content_id",    label: "TikTok Content ID",    color: "#69C9D0" },
  { key: "instagram",            label: "Instagram",            color: "#E1306C" },
  { key: "facebook",             label: "Facebook",             color: "#1877F2" },
  { key: "snapchat",             label: "Snapchat",             color: "#FFFC00" },
  { key: "capcut",               label: "CapCut",               color: "#9146FF" },
  { key: "whatsapp",             label: "WhatsApp",             color: "#25D366" },
  { key: "canva",                label: "Canva",                color: "#00C4CC" },
  { key: "twitch",               label: "Twitch Soundtrack",    color: "#9146FF" },
  // ── Rights & Licensing ────────────────────────────────────────
  { key: "musixmatch",           label: "Musixmatch",           color: "#FF0D57" },
  { key: "lyricfind",            label: "LyricFind",            color: "#0055FF" },
  { key: "audible_magic",        label: "Audible Magic",        color: "#555555" },
  { key: "audible_magic_rights", label: "Audible Magic Rights360", color: "#555555" },
  { key: "meta_rights",          label: "Meta Rights Manager",  color: "#0081FB" },
  { key: "soundtrack_your_brand",label: "Soundtrack Your Brand",color: "#00A550" },
  { key: "broadtime",            label: "Broadtime",            color: "#F59E0B" },
  { key: "viapath",              label: "ViaPath Technologies", color: "#6EE7B7" },
  { key: "jpay",                 label: "JPay",                 color: "#2563EB" },
  { key: "keefe",                label: "Keefe",                color: "#10B981" },
];

export const LISTENING_PLATFORMS: Platform[] = ALL_PLATFORMS.filter((p) =>
  [
    "spotify", "apple_music", "itunes", "youtube_music", "amazon_music",
    "deezer", "tidal", "audiomack", "boomplay", "soundcloud",
    "anghami", "pandora", "tiktok", "napster", "iheartradio",
    "shazam", "beatport", "youtube",
  ].includes(p.key)
);

export function getPlatform(key: string): Platform {
  return (
    ALL_PLATFORMS.find((p) => p.key === key) ?? {
      key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      color: "#007bff",
    }
  );
}
