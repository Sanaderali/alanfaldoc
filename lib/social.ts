/** Social media platforms the dashboard can link to. Client-safe (no Node APIs). Icons are Font Awesome (free) brand icons. */
export const SOCIAL_PLATFORMS = [
  { key: "facebook", label: "Facebook", icon: "fa-brands fa-facebook-f" },
  { key: "instagram", label: "Instagram", icon: "fa-brands fa-instagram" },
  { key: "x", label: "X (Twitter)", icon: "fa-brands fa-x-twitter" },
  { key: "linkedin", label: "LinkedIn", icon: "fa-brands fa-linkedin-in" },
  { key: "youtube", label: "YouTube", icon: "fa-brands fa-youtube" },
  { key: "tiktok", label: "TikTok", icon: "fa-brands fa-tiktok" },
  { key: "snapchat", label: "Snapchat", icon: "fa-brands fa-snapchat" },
  { key: "telegram", label: "Telegram", icon: "fa-brands fa-telegram" },
  { key: "pinterest", label: "Pinterest", icon: "fa-brands fa-pinterest-p" },
  { key: "threads", label: "Threads", icon: "fa-brands fa-threads" },
  { key: "whatsapp", label: "WhatsApp channel", icon: "fa-brands fa-whatsapp" },
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]["key"];
export const platformOf = (key: string) => SOCIAL_PLATFORMS.find((p) => p.key === key);
