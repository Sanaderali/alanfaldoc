"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions-auth";
import { btnPrimary, inputCls } from "../ui";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="user" className="block text-sm font-medium mb-1">Username</label>
        <input id="user" name="user" autoComplete="username" required className={inputCls} defaultValue="admin" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} />
      </div>
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
