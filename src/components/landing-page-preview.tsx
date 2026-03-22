"use client";

import { useEffect, useRef } from "react";
import { ExternalLink, Download, Copy } from "lucide-react";
import { toast } from "sonner";

interface LandingPagePreviewProps {
  html: string;
  streaming?: boolean;
}

const PLACEHOLDER_DOC =
  '<html><body><p style="padding:40px;color:#999;text-align:center;font-family:system-ui,sans-serif">Landing page will appear here…</p></body></html>';

/**
 * Extract the innerHTML of the <body> element from an HTML string.
 * Returns null if no <body> tag is found (e.g. during early streaming when
 * only the doctype and head have arrived).
 */
function extractBodyInner(html: string): string | null {
  const lower = html.toLowerCase();
  const bodyStart = lower.indexOf("<body");
  if (bodyStart === -1) return null;

  const tagEnd = html.indexOf(">", bodyStart);
  if (tagEnd === -1) return null;

  const contentStart = tagEnd + 1;
  const closeIdx = lower.lastIndexOf("</body>");

  return closeIdx > contentStart
    ? html.slice(contentStart, closeIdx)
    : html.slice(contentStart); // still streaming — no </body> yet
}

/**
 * Live iframe preview that avoids both white-flash flicker and font-swap jitter.
 *
 * Two techniques work together:
 *
 * 1. We write into the iframe via `contentDocument.open/write/close` instead of
 *    changing `srcDoc`. Unlike srcDoc (which triggers a full browser navigation
 *    with a blank white frame between old and new document), document.write
 *    replaces content synchronously within a single paint frame.
 *
 * 2. After the *first* full write establishes the document shell (head, CSS,
 *    fonts), subsequent streaming updates only replace `document.body.innerHTML`.
 *    This preserves the loaded Google Fonts and parsed CSS in the <head>, so
 *    there is no font-swap layout shift (the up-and-down text jitter).
 *
 * When streaming ends we do one final full write so that inline <script> tags
 * (IntersectionObserver animations, smooth scroll) execute properly.
 */
export function LandingPagePreview({
  html,
  streaming,
}: LandingPagePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const shellReady = useRef(false);
  const prevRaw = useRef("");
  const prevStreaming = useRef<boolean | undefined>();

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const raw = html.trim();
    const streamingJustEnded = prevStreaming.current === true && !streaming;
    prevStreaming.current = streaming;

    try {
      const doc = iframe.contentDocument;
      if (!doc) throw new Error("no contentDocument");

      // Empty → placeholder
      if (raw.length === 0) {
        if (prevRaw.current !== "") {
          doc.open();
          doc.write(PLACEHOLDER_DOC);
          doc.close();
        }
        shellReady.current = false;
        prevRaw.current = "";
        return;
      }

      // Nothing changed (unless streaming just ended — need a full write for scripts)
      if (raw === prevRaw.current && !streamingJustEnded) return;
      prevRaw.current = raw;

      // FAST PATH: shell is established during streaming → body-only update.
      // Fonts / CSS in <head> stay loaded (no font-swap jitter), and the
      // __forge_no_motion style keeps animations frozen (no bounce).
      if (streaming && shellReady.current && doc.body) {
        const inner = extractBodyInner(raw);
        if (inner !== null) {
          const scrollY = doc.documentElement?.scrollTop ?? 0;
          doc.body.innerHTML = inner;
          if (doc.documentElement) doc.documentElement.scrollTop = scrollY;
          return;
        }
      }

      // FULL WRITE: first render, head-only content, or streaming just ended.
      doc.open();
      doc.write(raw);
      doc.close();

      if (streaming) {
        shellReady.current = extractBodyInner(raw) !== null;

        if (doc.documentElement) {
          doc.documentElement.style.overflowY = "scroll";
          doc.documentElement.style.overflowX = "hidden";
        }

        // Freeze all CSS motion while streaming. Generated pages use
        // @keyframes fade-in animations — each body.innerHTML replacement
        // recreates every element, which restarts those animations from
        // their initial keyframe (e.g. opacity:0 + translateY:30px),
        // causing visible "jumping." This forces animations to their end
        // state instantly and suppresses transitions entirely.
        // Removed automatically when streaming ends (final full write
        // replaces the entire document).
        if (doc.head && !doc.getElementById("__forge_no_motion")) {
          const style = doc.createElement("style");
          style.id = "__forge_no_motion";
          style.textContent = [
            "*, *::before, *::after {",
            "  animation-duration: 0.001s !important;",
            "  animation-delay: 0s !important;",
            "  transition-duration: 0s !important;",
            "  transition-delay: 0s !important;",
            "}",
          ].join("\n");
          doc.head.appendChild(style);
        }
      } else {
        shellReady.current = false;
      }
    } catch {
      iframe.srcdoc = raw;
    }
  }, [html, streaming]);

  const openInNewTab = () => {
    const w = window.open();
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "landing-page.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
    toast.success("HTML copied to clipboard");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-10 shrink-0 items-center justify-end gap-2">
        {!streaming && html ? (
          <>
            <button
              type="button"
              onClick={openInNewTab}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border hover:bg-muted transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open
            </button>
            <button
              type="button"
              onClick={downloadHtml}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border hover:bg-muted transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button
              type="button"
              onClick={copyHtml}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border hover:bg-muted transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </>
        ) : null}
      </div>

      <div className="relative h-[600px] w-full shrink-0 overflow-hidden rounded-lg border border-border bg-white">
        {streaming && (
          <div className="absolute top-2 right-2 z-10 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground shadow-sm">
            Generating…
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="absolute inset-0 h-full w-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin"
          title="Generated Landing Page"
        />
      </div>
    </div>
  );
}
