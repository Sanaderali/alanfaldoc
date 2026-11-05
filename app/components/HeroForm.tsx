"use client";

import { useState } from "react";

/** Home page quick request: name, email and service. Creates a support ticket and sends the thank-you email. */
export default function HeroForm({ services }: { services: string[] }) {
  const [f, setF] = useState({ name: "", email: "", service: "" });
  const [trap, setTrap] = useState("");
  const [st, setSt] = useState<{ sending: boolean; ok?: { name: string; number: number }; error?: string }>({ sending: false });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSt({ sending: true });
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.name, email: f.email, question: f.service || "General enquiry", message: `Consultation request from the home page.${f.service ? ` Service: ${f.service}.` : ""}`, website: trap }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? "Could not send your request. Please try again.");
      setSt({ sending: false, ok: { name: f.name.trim().split(/\s+/)[0], number: d.number } });
      setF({ name: "", email: "", service: "" });
    } catch (x) {
      setSt({ sending: false, error: (x as Error).message });
    }
  };

  if (st.ok) {
    return (
      <div role="status" className="text-center py-4">
        <p className="text-lg font-bold text-brand-text">Thank you, {st.ok.name}!</p>
        <p className="text-gray-600 text-sm mt-1">We have received your request (ref #{st.ok.number}) and sent a confirmation to your email. Our team will get back to you as soon as possible.</p>
        <button type="button" onClick={() => setSt({ sending: false })} className="mt-3 text-sm text-brand-text underline">Send another request</button>
      </div>
    );
  }
  const field = "px-4 py-3 border border-gray-300 rounded text-ink focus:ring-2 focus:ring-brand focus:border-transparent";
  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Request a consultation">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} className="hidden" aria-hidden="true" />
      <input type="text" name="name" required maxLength={80} autoComplete="name" aria-label="Your name" placeholder="Enter Your Name*" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={field} />
      <input type="email" name="email" required autoComplete="email" aria-label="Your email" placeholder="Enter Your Email*" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={field} />
      <select name="service" aria-label="Service" value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })} className={`${field} text-gray-700`}>
        <option value="">Select a service</option>
        {services.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <button type="submit" disabled={st.sending} className="btn btn-primary">{st.sending ? "SENDING…" : "SEND REQUEST"}</button>
      {st.error && <p role="alert" className="sm:col-span-2 lg:col-span-4 text-sm text-accent text-center">{st.error}</p>}
    </form>
  );
}
