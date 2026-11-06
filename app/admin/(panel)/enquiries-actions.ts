"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { requirePerm } from "@/lib/auth";
import { mutate, now, readAll } from "@/lib/store";
import { refreshSite } from "@/lib/revalidate";

/** Put a client's chat feedback into Dashboard -> Reviews as a DRAFT (you review and publish it there). */
export async function feedbackToReview(chatId: string) {
  await requirePerm("content.edit");
  const chat = (await readAll("chats")).find((c) => c.id === chatId);
  if (chat?.feedback && !chat.feedback.reviewId) {
    const id = randomUUID();
    const text = chat.feedback.comment || `${chat.feedback.rating} out of 5 stars after a live chat.`;
    await mutate("reviews", (all) => [{ id, status: "draft" as const, name: chat.profile?.name || chat.name || "Client", role: chat.profile?.query?.slice(0, 80) || "Live chat client", text, rating: chat.feedback!.rating, createdAt: now(), updatedAt: now() }, ...all]);
    await mutate("chats", (all) => all.map((c) => (c.id === chatId && c.feedback ? { ...c, feedback: { ...c.feedback, reviewId: id } } : c)));
    refreshSite();
  }
  redirect("/admin/enquiries");
}

export async function deleteKnowledge(id: string) {
  await requirePerm("chat.reply");
  await mutate("knowledge", (all) => all.filter((k) => k.id !== id));
  redirect("/admin/knowledge");
}

/** Turn a frequently asked question into an approved library answer (served without Groq from now on). */
export async function approveQuestion(formData: FormData) {
  const me = await requirePerm("chat.reply");
  const id = String(formData.get("id") ?? "");
  const answer = String(formData.get("answer") ?? "").replace(/\s+/g, " ").trim().slice(0, 1200);
  const q = (await readAll("questions")).find((x) => x.id === id);
  if (q && answer.length >= 10 && !/(\bAED\b|\bUSD\b|\$\s?\d|\d+\s?(dirhams?|aed)|iban|swift|account number|card number|invoice|receipt|payment link)/i.test(answer) && !/@|\+?\d[\d\s-]{8,}/.test(answer)) {
    await mutate("knowledge", (all) => [{ id: randomUUID(), status: "published" as const, question: q.sample, answer, addedBy: me.name || me.username, createdAt: now(), updatedAt: now() }, ...all.filter((k) => k.question !== q.sample)].slice(0, 400));
    await mutate("questions", (all) => all.map((x) => (x.id === id ? { ...x, status: "draft" as const, updatedAt: now() } : x)));
  }
  redirect("/admin/knowledge");
}
