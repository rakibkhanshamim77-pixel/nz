"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  initialHtml: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
}

const INLINE_CMDS = [
  "bold", "italic", "underline", "strikeThrough",
  "insertUnorderedList", "insertOrderedList",
  "justifyLeft", "justifyCenter", "justifyRight",
] as const;

const BLOCK_NAME: Record<string, string> = {
  P: "Paragraph", H1: "Heading 1", H2: "Heading 2", H3: "Heading 3",
  LI: "List item", DIV: "Paragraph",
};

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function toEditorHtml(value: string): string {
  if (!value.trim()) return "";
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  return value
    .split(/\n{2,}|\r\n\r\n/)
    .map((para) => `<p>${escapeHtml(para.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

type Cmd = (typeof INLINE_CMDS)[number] | "undo" | "redo" | "unlink" | "removeFormat";

function ToolButton({ label, pressed, onRun, children, text }: {
  label: string; pressed?: boolean; onRun: () => void; children: React.ReactNode; text?: boolean;
}) {
  return (
    <button type="button" className={`tb ${text ? "txt" : ""}`} title={label} aria-label={label}
      aria-pressed={pressed === undefined ? undefined : pressed}
      onMouseDown={(e) => e.preventDefault()} onClick={onRun}>
      {children}
    </button>
  );
}

export default function RichTextEditor({ initialHtml, onChange, placeholder, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [pressed, setPressed] = useState<Record<string, boolean>>({});
  const [block, setBlock] = useState("P");
  const [counts, setCounts] = useState({ words: 0, chars: 0 });
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [linkErr, setLinkErr] = useState(false);

  const updateCounts = useCallback(() => {
    const t = ref.current?.textContent?.trim() ?? "";
    setCounts({ words: t ? t.split(/\s+/).length : 0, chars: t.length });
  }, []);

  const emit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML === "<br>" || el.innerHTML === "<p><br></p>") el.innerHTML = "";
    updateCounts();
    onChange(el.innerHTML);
  }, [onChange, updateCounts]);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = toEditorHtml(initialHtml);
    updateCounts();
    try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncToolbar = useCallback(() => {
    const el = ref.current;
    const sel = document.getSelection();
    if (!el || !sel?.rangeCount || !el.contains(sel.anchorNode)) return;
    const next: Record<string, boolean> = {};
    for (const c of INLINE_CMDS) {
      try { next[c] = document.queryCommandState(c); } catch { next[c] = false; }
    }
    setPressed(next);
    let node: HTMLElement | null =
      sel.anchorNode?.nodeType === 1 ? (sel.anchorNode as HTMLElement) : (sel.anchorNode?.parentElement ?? null);
    while (node && node !== el && !/^(P|H1|H2|H3|LI|DIV)$/.test(node.tagName)) node = node.parentElement;
    setBlock(node && node !== el ? node.tagName : "P");
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", syncToolbar);
    return () => document.removeEventListener("selectionchange", syncToolbar);
  }, [syncToolbar]);

  const exec = (cmd: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    syncToolbar();
    emit();
  };

  const run = (cmd: Cmd) => () => exec(cmd);

  function openLink() {
    const sel = document.getSelection();
    const el = ref.current;
    savedRange.current = sel?.rangeCount && el?.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null;
    const anchor = sel?.anchorNode?.parentElement?.closest("a");
    setLinkUrl(anchor?.getAttribute("href") ?? "");
    setLinkErr(false);
    setLinkOpen(true);
  }

  function applyLink() {
    let url = linkUrl.trim();
    if (url && !/^(https?:|mailto:|tel:|\/|#)/i.test(url)) url = "https://" + url;
    if (!url || !/^(https?:\/\/\S+|mailto:\S+|tel:\S+|\/\S*|#\S*)$/i.test(url)) {
      setLinkErr(true); return;
    }
    const el = ref.current;
    if (!el) return;
    el.focus();
    const sel = document.getSelection();
    if (savedRange.current && sel) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
    if (!sel || sel.isCollapsed)
      document.execCommand("insertHTML", false, `<a href="${escapeHtml(url)}">${escapeHtml(url.replace(/^https?:\/\//, ""))}</a>`);
    else document.execCommand("createLink", false, url);
    if (linkNewTab)
      el.querySelectorAll(`a[href="${CSS.escape(url)}"]`).forEach((a) => {
        a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener noreferrer");
      });
    setLinkOpen(false);
    emit();
  }

  useEffect(() => {
    if (!linkOpen) return;
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-link-pop]") && !t.closest("[data-link-btn]")) setLinkOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [linkOpen]);

  const blockBtn = (tag: string, lbl: string, short: string) => (
    <ToolButton text label={lbl} pressed={(block === "DIV" ? "P" : block) === tag} onRun={() => exec("formatBlock", `<${tag.toLowerCase()}>`)}>
      {short}
    </ToolButton>
  );

  const ph = placeholder ?? "কন্টেন্ট লিখুন…";

  return (
    <div>
      {label && <span className="lbl block mb-1">{label}</span>}
      <div className="rte-wrap">
        <div className="rte-bar" role="toolbar" aria-label="Text formatting">
          <div className="grp">
            <ToolButton label="Undo" onRun={run("undo")}><svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" /></svg></ToolButton>
            <ToolButton label="Redo" onRun={run("redo")}><svg viewBox="0 0 24 24"><path d="m15 14 5-5-5-5" /><path d="M20 9H9a5 5 0 0 0 0 10h3" /></svg></ToolButton>
          </div>
          <div className="grp">
            {blockBtn("P", "Paragraph", "P")}
            {blockBtn("H2", "Heading 2", "H2")}
            {blockBtn("H3", "Heading 3", "H3")}
          </div>
          <div className="grp">
            <ToolButton label="Bold" pressed={!!pressed.bold} onRun={run("bold")}><svg viewBox="0 0 24 24"><path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" strokeWidth={2.4} /></svg></ToolButton>
            <ToolButton label="Italic" pressed={!!pressed.italic} onRun={run("italic")}><svg viewBox="0 0 24 24"><path d="M14 5h-4M14 19h-4M14 5l-4 14" /></svg></ToolButton>
            <ToolButton label="Underline" pressed={!!pressed.underline} onRun={run("underline")}><svg viewBox="0 0 24 24"><path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14" /></svg></ToolButton>
          </div>
          <div className="grp">
            <ToolButton label="Bullet list" pressed={!!pressed.insertUnorderedList} onRun={run("insertUnorderedList")}><svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" fill="currentColor" /><circle cx="4.5" cy="12" r="1" fill="currentColor" /><circle cx="4.5" cy="18" r="1" fill="currentColor" /></svg></ToolButton>
            <ToolButton label="Numbered list" pressed={!!pressed.insertOrderedList} onRun={run("insertOrderedList")}><svg viewBox="0 0 24 24"><path d="M10 6h10M10 12h10M10 18h10M4 4h1v4M4 8h2M4 14.5a1.2 1.2 0 0 1 2 .8L4 18h2.2" strokeWidth={1.6} /></svg></ToolButton>
          </div>
          <div className="grp">
            <ToolButton label="Align left" pressed={!!pressed.justifyLeft} onRun={run("justifyLeft")}><svg viewBox="0 0 24 24"><path d="M4 6h16M4 10h10M4 14h16M4 18h10" /></svg></ToolButton>
            <ToolButton label="Align centre" pressed={!!pressed.justifyCenter} onRun={run("justifyCenter")}><svg viewBox="0 0 24 24"><path d="M4 6h16M7 10h10M4 14h16M7 18h10" /></svg></ToolButton>
            <ToolButton label="Align right" pressed={!!pressed.justifyRight} onRun={run("justifyRight")}><svg viewBox="0 0 24 24"><path d="M4 6h16M10 10h10M4 14h16M10 18h10" /></svg></ToolButton>
          </div>
          <div className="grp relative">
            <button type="button" className="tb" data-link-btn title="Link" aria-label="Insert link" aria-expanded={linkOpen}
              onMouseDown={(e) => e.preventDefault()} onClick={() => (linkOpen ? setLinkOpen(false) : openLink())}>
              <svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
            </button>
            <ToolButton label="Remove link" onRun={run("unlink")}><svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l1.3-1.3M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1M4 4l16 16" /></svg></ToolButton>
            {linkOpen && (
              <div className="link-pop" data-link-pop>
                <input className={`inp !h-10 text-sm ${linkErr ? "err" : ""}`} placeholder="https://example.com"
                  autoComplete="off" autoFocus value={linkUrl} aria-label="Link URL"
                  onChange={(e) => { setLinkUrl(e.target.value); setLinkErr(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } if (e.key === "Escape") setLinkOpen(false); }} />
                <label className="flex items-center gap-2 text-xs mt-2" style={{ color: "var(--mute)" }}>
                  <input type="checkbox" className="w-3.5 h-3.5 accent-[var(--ink)]" checked={linkNewTab} onChange={(e) => setLinkNewTab(e.target.checked)} />
                  নতুন ট্যাবে খুলুন
                </label>
                <div className="flex gap-2 mt-3">
                  <button type="button" className="btn-ghost !h-9 !px-3 flex-1 justify-center text-xs" onClick={() => setLinkOpen(false)}>বাতিল</button>
                  <button type="button" className="btn-solid !h-9 !px-3 flex-1 justify-center text-xs" onClick={applyLink}>যোগ করুন</button>
                </div>
              </div>
            )}
          </div>
          <div className="grp ml-auto">
            <ToolButton label="Clear formatting" onRun={run("removeFormat")}><svg viewBox="0 0 24 24"><path d="M6 5h12M12 5l-3 14M4 20l16-16" /></svg></ToolButton>
          </div>
        </div>
        <div ref={ref} className="rte" contentEditable suppressContentEditableWarning
          role="textbox" aria-multiline="true"
          data-ph={ph}
          onInput={emit} onBlur={emit}
          onPaste={(e) => { e.preventDefault(); document.execCommand("insertText", false, e.clipboardData.getData("text/plain")); }}
          onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openLink(); } }}
        />
        <div className="rte-foot">
          <span>{BLOCK_NAME[block] ?? "Paragraph"}</span>
          <span>{counts.words} শব্দ · {counts.chars} অক্ষর</span>
        </div>
      </div>
    </div>
  );
}
