"use client";

import { useState } from "react";
import { Copy, Check, Link, RefreshCw } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: string | null;
}

export function InviteModal({ open, onOpenChange, locationId }: InviteModalProps) {
  const [code, setCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window?.location?.origin ?? "";

  const generateCode = async () => {
    setIsGenerating(true);
    setError(null);

    const res = await fetch("/api/members/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location_id: locationId }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to generate invite code");
    } else {
      setCode(data.code);
    }
    setIsGenerating(false);
  };

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClose = () => {
    setCode(null);
    setError(null);
    onOpenChange(false);
  };

  const inviteLink = code ? `${appUrl}/join/${code}` : "";

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="Add Team Member"
      description="Generate a one-time invite code. It expires in 48 hours."
    >
      {!code ? (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-sm text-[#EF4444]">
              {error}
            </div>
          )}
          <Button
            onClick={generateCode}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Generating…
              </>
            ) : (
              "Generate Invite Code"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Big code display */}
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-6 text-center">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#555] font-[var(--font-display)] mb-2">
              Invite Code
            </p>
            <p className="text-4xl font-bold tracking-[0.2em] font-[var(--font-display)] text-[#FF6B35]">
              {code}
            </p>
            <p className="text-xs text-[#555] mt-2">Expires in 48 hours · Single use</p>
          </div>

          {/* Copy code */}
          <button
            onClick={() => copyToClipboard(code, "code")}
            className="w-full flex items-center justify-between p-3 bg-[#242424] hover:bg-[#2A2A2A] border border-[#2A2A2A] rounded-lg transition-colors group"
          >
            <span className="text-sm text-[#888] font-mono">{code}</span>
            {copied === "code" ? (
              <Check size={16} className="text-[#22C55E]" />
            ) : (
              <Copy size={16} className="text-[#555] group-hover:text-[#888]" />
            )}
          </button>

          {/* Copy link */}
          <button
            onClick={() => copyToClipboard(inviteLink, "link")}
            className="w-full flex items-center justify-between p-3 bg-[#242424] hover:bg-[#2A2A2A] border border-[#2A2A2A] rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Link size={14} className="text-[#555] flex-shrink-0" />
              <span className="text-sm text-[#888] truncate">{inviteLink}</span>
            </div>
            {copied === "link" ? (
              <Check size={16} className="text-[#22C55E] flex-shrink-0 ml-2" />
            ) : (
              <Copy size={16} className="text-[#555] group-hover:text-[#888] flex-shrink-0 ml-2" />
            )}
          </button>

          {/* Generate new */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setCode(null); generateCode(); }}
            className="w-full"
          >
            <RefreshCw size={14} />
            Generate New Code
          </Button>
        </div>
      )}
    </Modal>
  );
}
