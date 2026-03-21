"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import type { MarketingCampaign } from "@/lib/schemas";

interface MarketingTabsProps {
  campaign: MarketingCampaign;
}

function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        toast.success("Copied!");
      }}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <Copy className="w-3 h-3" />
    </button>
  );
}

function ContentBlock({ title, content }: { title?: string; content: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 relative group">
      {title && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{title}</span>
          <CopyButton text={content} />
        </div>
      )}
      <p className="text-sm whitespace-pre-wrap">{content}</p>
      {!title && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={content} />
        </div>
      )}
    </div>
  );
}

export function MarketingContent({ campaign }: MarketingTabsProps) {
  return (
    <div className="space-y-8">
      {/* Email Sequences */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Email Sequences</h3>
        <div className="space-y-3">
          {campaign.email_sequences.map((email, i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  Day {email.send_day}: {email.subject}
                </span>
                <CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} />
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Preview: {email.preview_text}
              </p>
              <p className="text-sm whitespace-pre-wrap">{email.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Twitter */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Twitter Posts</h3>
        <div className="space-y-2">
          {campaign.twitter_posts.map((post, i) => (
            <ContentBlock key={i} content={post} />
          ))}
        </div>
      </section>

      {/* LinkedIn */}
      <section>
        <h3 className="text-lg font-semibold mb-3">LinkedIn Posts</h3>
        <div className="space-y-2">
          {campaign.linkedin_posts.map((post, i) => (
            <ContentBlock key={i} content={post} />
          ))}
        </div>
      </section>

      {/* Instagram */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Instagram Captions</h3>
        <div className="space-y-2">
          {campaign.instagram_captions.map((cap, i) => (
            <ContentBlock key={i} content={cap} />
          ))}
        </div>
      </section>

      {/* Google Ads */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Google Ad Copy</h3>
        <div className="space-y-2">
          {campaign.google_ad_copy.map((ad, i) => (
            <ContentBlock
              key={i}
              title={ad.headline}
              content={ad.description}
            />
          ))}
        </div>
      </section>

      {/* Press Release */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Press Release</h3>
        <ContentBlock content={campaign.press_release} />
      </section>
    </div>
  );
}
