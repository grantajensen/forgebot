"use client";

import { ExternalLink, Download, Copy } from "lucide-react";
import { toast } from "sonner";

interface LandingPagePreviewProps {
  html: string;
  streaming?: boolean;
}

export function LandingPagePreview({ html, streaming }: LandingPagePreviewProps) {
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
    <div className="space-y-3">
      {!streaming && html && (
        <div className="flex gap-2 justify-end">
          <button
            onClick={openInNewTab}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border hover:bg-muted transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open
          </button>
          <button
            onClick={downloadHtml}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border hover:bg-muted transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
          <button
            onClick={copyHtml}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border hover:bg-muted transition-colors"
          >
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
        </div>
      )}

      <div className="relative rounded-lg border bg-white overflow-hidden">
        {streaming && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full animate-pulse z-10">
            Generating...
          </div>
        )}
        <iframe
          srcDoc={html || "<html><body><p style='padding:40px;color:#999;text-align:center;'>Landing page will appear here...</p></body></html>"}
          className="w-full h-[600px] border-0"
          sandbox="allow-scripts"
          title="Generated Landing Page"
        />
      </div>
    </div>
  );
}
