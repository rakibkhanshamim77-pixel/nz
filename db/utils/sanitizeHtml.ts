const ALLOWED_TAGS = new Set([
  "p", "br", "h1", "h2", "h3", "b", "strong", "i", "em", "u", "s", "strike",
  "ul", "ol", "li", "a", "div", "span",
]);

const DROP_WITH_CONTENT = /<(script|style|iframe|object|embed|noscript|template|svg|math|form|textarea|select)\b[\s\S]*?<\/\1\s*>/gi;

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;
const ALIGN = /text-align\s*:\s*(left|right|center|justify)/i;

function attr(attrs: string, name: string): string | undefined {
  const m = attrs.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return m ? (m[1] ?? m[2] ?? m[3]) : undefined;
}

const escAttr = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Allow-list sanitizer for the product description editor's output. */
export function sanitizeRichText(html: string): string {
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(DROP_WITH_CONTENT, "")
    .replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, (tag, rawName: string, attrs: string) => {
      const name = rawName.toLowerCase();
      if (!ALLOWED_TAGS.has(name)) return "";
      if (tag.startsWith("</")) return `</${name}>`;
      if (name === "br") return "<br>";

      let out = `<${name}`;
      if (name === "a") {
        const href = attr(attrs, "href")?.trim().replace(/[\u0000-\u001f\s]+/g, "");
        if (href && SAFE_HREF.test(href)) out += ` href="${escAttr(href)}"`;
        if (attr(attrs, "target") === "_blank") out += ` target="_blank" rel="noopener noreferrer"`;
      }
      const align = attr(attrs, "style")?.match(ALIGN)?.[1];
      if (align && name !== "a") out += ` style="text-align:${align.toLowerCase()}"`;
      return `${out}>`;
    })
    // Anything that still looks like markup but wasn't rebuilt above is text
    .replace(/<(?!\/?(?:p|br|h[1-3]|b|strong|i|em|u|s|strike|ul|ol|li|a|div|span)[\s>])/gi, "&lt;")
    .trim();

  return cleaned.replace(/^(<br>|<p><br><\/p>|\s)+$/i, "");
}

export function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
