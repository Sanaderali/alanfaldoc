"use client";

import { useActionState, useState } from "react";
import Icon from "@/app/components/Icon";
import { login, type LoginState } from "../actions-auth";
import { btnPrimary, inputCls } from "../ui";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="user" className="block text-sm font-medium mb-1">Username</label>
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
            className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-gray-500 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-r-md"
          >
            <Icon name={show ? "eye-slash" : "eye"} />
          </button>
        </div>
      </div>
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
