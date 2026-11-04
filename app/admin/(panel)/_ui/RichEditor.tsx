"use client";

import { useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import Icon from "@/app/components/Icon";
import { MediaPicker } from "./fields";

/** WYSIWYG editor (TipTap). Output is plain HTML; the server sanitises it again before saving. */

const SizedImage = Image.extend({
  addAttributes() {
    return { ...this.parent?.(), width: { default: null }, height: { default: null } };
  },
});

function Btn({ onClick, active, label, icon, disabled }: { onClick: () => void; active?: boolean; label: string; icon: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // keep the text selection while clicking
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`w-9 h-9 inline-flex items-center justify-center rounded-md text-sm transition-colors disabled:opacity-30 ${active ? "bg-brand-100 text-brand-text" : "text-gray-600 hover:bg-gray-100"}`}
    >
      <Icon name={icon} />
    </button>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");

  const block = editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : "p";
  const setBlock = (v: string) => {
    const c = editor.chain().focus();
    if (v === "p") c.setParagraph().run();
    else c.setHeading({ level: v === "h2" ? 2 : 3 }).run();
  };
  const openLink = () => { setUrl(editor.getAttributes("link").href ?? ""); setLinkOpen(true); };
  const applyLink = () => {
    const u = url.trim();
    if (!u) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: /^(https?:\/\/|\/|mailto:|tel:)/.test(u) ? u : `https://${u}` }).run();
    setLinkOpen(false);
  };

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 rounded-t-lg">
      <div className="flex flex-wrap items-center gap-0.5 p-2">
        <select value={block} onChange={(e) => setBlock(e.target.value)} aria-label="Text style" className="h-9 mr-1 px-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand/40">
          <option value="p">Paragraph</option>
          <option value="h2">Heading</option>
          <option value="h3">Sub-heading</option>
        </select>
        <Btn label="Bold" icon="bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <Btn label="Italic" icon="italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <Btn label="Underline" icon="underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <span className="w-px h-6 bg-gray-200 mx-1" />
        <Btn label="Bulleted list" icon="list-ul" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <Btn label="Numbered list" icon="list-ol" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <Btn label="Quote" icon="quote-left" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <span className="w-px h-6 bg-gray-200 mx-1" />
        <Btn label="Add link" icon="link" active={editor.isActive("link")} onClick={openLink} />
        <Btn label="Insert image" icon="image" onClick={onImage} />
        <Btn label="Divider line" icon="minus" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <span className="w-px h-6 bg-gray-200 mx-1" />
        <Btn label="Undo" icon="rotate-left" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
        <Btn label="Redo" icon="rotate-right" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
      </div>
      {linkOpen && (
        <div className="flex items-center gap-2 px-3 pb-3">
          <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } if (e.key === "Escape") setLinkOpen(false); }} placeholder="Paste a link, e.g. https://… or /services/trade-license" aria-label="Link address" className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/40" />
          <button type="button" onClick={applyLink} className="px-3 py-2 text-sm font-medium bg-gray-900 text-white rounded-md">{url.trim() ? "Apply" : "Remove link"}</button>
          <button type="button" onClick={() => setLinkOpen(false)} className="px-3 py-2 text-sm text-gray-600">Cancel</button>
        </div>
      )}
    </div>
  );
}

export default function RichEditor({ value, onChange, placeholder = "Start writing…" }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const [picker, setPicker] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true } }), SizedImage, Placeholder.configure({ placeholder })],
    content: value,
    immediatelyRender: false, // avoid SSR hydration mismatch
    shouldRerenderOnTransaction: true, // toolbar highlights follow the cursor
    editorProps: { attributes: { class: "rich-content px-5 py-4", "aria-label": "Content editor" } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  if (!editor) return <div className="border border-gray-300 rounded-lg bg-white h-96 animate-pulse" aria-busy="true" />;
  return (
    <div className="border border-gray-300 rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-brand/30">
      <Toolbar editor={editor} onImage={() => setPicker(true)} />
      <EditorContent editor={editor} />
      <MediaPicker
        open={picker}
        onClose={() => setPicker(false)}
        onPick={(m) => editor.chain().focus().setImage({ src: `/uploads/${m.file}`, alt: m.alt, width: m.width, height: m.height } as never).run()}
      />
    </div>
  );
}
