"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MessageSquare } from "lucide-react";

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  useEffect(() => {
    if (code) {
      router.replace(`/onboarding?code=${encodeURIComponent(code)}`);
    }
  }, [code, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F0F] p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#FF6B35] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FF6B35]/20 animate-pulse">
          <MessageSquare size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-wider font-[var(--font-display)] uppercase text-[#F5F5F5] mb-2">
          ShiftSmart
        </h1>
        <p className="text-sm text-[#555]">Joining with code {code}…</p>
      </div>
    </div>
  );
}
