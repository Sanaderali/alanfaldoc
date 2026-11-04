"use client";

/** "Select all" checkbox for the list table header/footer. Row checkboxes carry form="bulk". */
export default function SelectAll({ label = "Select all" }: { label?: string }) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      className="rounded-[3px] border-[#8c8f94] text-brand focus:ring-brand"
      onChange={(e) => document.querySelectorAll<HTMLInputElement>('input[name="ids"][form="bulk"]').forEach((c) => { c.checked = e.target.checked; })}
    />
  );
}
