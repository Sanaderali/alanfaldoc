"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/app/components/Icon";
import { btnPrimary, inputCls } from "../ui";

/** Standard HTML form (works without JavaScript). The client code only powers the show/hide eye button. */
export default function LoginForm({ error }: { error?: string }) {
  const [show, setShow] = useState(false);
  return (
    <form method="post" action="/admin/api/login" className="space-y-4">
      <div>
        <label htmlFor="user" className="block text-sm font-medium mb-1">Username or email</label>
        <input id="user" name="user" autoComplete="username" required className={inputCls} defaultValue="admin" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
        <div className="relative">
          <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required className={`${inputCls} pr-11`} />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            title={show ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-a-muted hover:text-a-text focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-r-md"
          >
            <Icon name={show ? "eye-slash" : "eye"} />
          </button>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-a-red">{error}</p>}
      <button type="submit" className={`${btnPrimary} w-full`}>Sign in</button>
      <p className="text-center"><Link href="/admin/forgot" className="text-sm text-a-muted hover:text-a-text hover:underline">Forgot username or password?</Link></p>
    </form>
  );
}
