import type { Role } from "@/types/content";

/**
 * Roles and permissions. Client-safe (no Node APIs) so menus and UI can use it too.
 * Effective permissions of a user = permissions of their role + any extra permissions granted by the Super Admin.
 */
export const ROLES: Role[] = ["super_admin", "administrator", "manager", "content_editor", "support_agent"];

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  administrator: "Administrator",
  manager: "Manager",
  content_editor: "Content Editor",
  support_agent: "Support Agent",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  super_admin: "Full control, including creating and managing team members.",
  administrator: "Everything except managing team members.",
  manager: "Content, SEO, media, live chat and tickets.",
  content_editor: "Writes and publishes content, FAQs and media. No deleting, chat or tickets.",
  support_agent: "Only live chat conversations and tickets.",
};

export const PERMISSIONS = [
  { key: "dashboard.view", label: "View dashboard statistics" },
  { key: "content.view", label: "View posts, services, countries" },
  { key: "content.edit", label: "Create and edit content" },
  { key: "content.publish", label: "Publish and schedule content" },
  { key: "content.delete", label: "Trash and delete content" },
  { key: "taxonomy.manage", label: "Manage categories and tags" },
  { key: "faqs.manage", label: "Manage FAQs" },
  { key: "seo.manage", label: "Manage page SEO and schema" },
  { key: "media.manage", label: "Upload and manage media" },
  { key: "chat.view", label: "View live chats" },
  { key: "chat.reply", label: "Reply to live chats" },
  { key: "tickets.view", label: "View tickets" },
  { key: "tickets.reply", label: "Reply to and close tickets" },
  { key: "settings.manage", label: "Manage site settings (WhatsApp numbers)" },
  { key: "backup.export", label: "Download backups" },
  { key: "users.manage", label: "Manage team members and roles" },
] as const;
export type Permission = (typeof PERMISSIONS)[number]["key"];
const ALL = PERMISSIONS.map((p) => p.key) as Permission[];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ALL,
  administrator: ALL.filter((p) => p !== "users.manage"),
  manager: ["dashboard.view", "content.view", "content.edit", "content.publish", "content.delete", "taxonomy.manage", "faqs.manage", "seo.manage", "media.manage", "chat.view", "chat.reply", "tickets.view", "tickets.reply"],
  content_editor: ["dashboard.view", "content.view", "content.edit", "content.publish", "taxonomy.manage", "faqs.manage", "seo.manage", "media.manage"],
  support_agent: ["chat.view", "chat.reply", "tickets.view", "tickets.reply"],
};

type Who = { role: Role; extraPermissions?: string[] };

export function permissionsOf(user: Who): Set<string> {
  const set = new Set<string>(ROLE_PERMISSIONS[user.role] ?? []);
  for (const p of user.extraPermissions ?? []) if ((ALL as string[]).includes(p)) set.add(p);
  return set;
}
export const can = (user: Who | null | undefined, perm: Permission) => !!user && permissionsOf(user).has(perm);

/** where a role lands after login */
export function landingPath(user: Who): string {
  const perms = permissionsOf(user);
  if (perms.has("dashboard.view")) return "/admin";
  if (perms.has("chat.view")) return "/admin/chat";
  if (perms.has("tickets.view")) return "/admin/tickets";
  return "/admin/profile";
}
