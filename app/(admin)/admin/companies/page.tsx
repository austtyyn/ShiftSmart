"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowUpRight,
  Users,
  MessageSquare,
  Calendar,
  Search,
  Plus,
  X,
  Loader2,
  Copy,
  Check,
  Link as LinkIcon,
  Crown,
  ShieldCheck,
  User,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Company {
  id: string;
  name: string;
  brand: string | null;
  created_at: string;
  member_count: number;
  message_count: number;
  shift_count: number;
}

type InviteRole = "owner" | "manager" | "crew";

const ROLE_OPTIONS: { value: InviteRole; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { value: "owner", label: "Owner", desc: "Full access — billing, all settings", icon: Crown, color: "text-[#FF6B35]" },
  { value: "manager", label: "Manager", desc: "Add/remove crew, schedule, announcements", icon: ShieldCheck, color: "text-[#F59E0B]" },
  { value: "crew", label: "Crew", desc: "Chat, view schedule, acknowledge", icon: User, color: "text-[#888]" },
];

interface CreatedResult {
  location: Company;
  invite: { code: string; expires_at: string; role: InviteRole } | null;
}

function CreateCompanyModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (company: Company) => void;
}) {
  const [step, setStep] = useState<"details" | "invite">("details");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("owner");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatedResult | null>(null);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  const reset = () => {
    setStep("details");
    setName("");
    setBrand("");
    setInviteRole("owner");
    setError(null);
    setResult(null);
    setCopied(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/companies/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), brand: brand.trim() || null, invite_role: inviteRole }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to create company");
      setIsSubmitting(false);
      return;
    }

    setResult(data);
    onCreated({ ...data.location, member_count: 0, message_count: 0, shift_count: 0 });
    setStep("invite");
    setIsSubmitting(false);
  };

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={step === "invite" ? handleClose : undefined} />
      <div className="relative w-full max-w-md bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold tracking-wide font-[var(--font-display)] uppercase text-[#F5F5F5]">
              {step === "details" ? "New Company" : "Company Created"}
            </h2>
            <p className="text-xs text-[#555] mt-0.5">
              {step === "details" ? "Creates a new store location" : result?.location.name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#555] hover:text-[#F5F5F5] hover:bg-[#242424] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 mb-5">
          <div className="flex-1 h-1 rounded-full bg-[#FF6B35]" />
          <div className={`flex-1 h-1 rounded-full ${step === "invite" ? "bg-[#FF6B35]" : "bg-[#2A2A2A]"}`} />
        </div>

        {/* ── STEP 1: Details ── */}
        {step === "details" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-sm text-[#EF4444]">
                {error}
              </div>
            )}

            {/* Brand */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-widest uppercase text-[#888] font-[var(--font-display)]">
                Brand{" "}
                <span className="text-[#444] normal-case font-normal tracking-normal">optional</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Taco Bell, McDonald's"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="h-12 w-full rounded-lg bg-[#0F0F0F] border border-[#2A2A2A] px-4 text-sm text-[#F5F5F5] placeholder:text-[#444] focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-colors"
              />
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-widest uppercase text-[#888] font-[var(--font-display)]">
                Location Name <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                placeholder='e.g. "Store #42", "Downtown", "Main St"'
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
                className="h-12 w-full rounded-lg bg-[#0F0F0F] border border-[#2A2A2A] px-4 text-sm text-[#F5F5F5] placeholder:text-[#444] focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-colors"
              />
            </div>

            {/* Invite role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-widest uppercase text-[#888] font-[var(--font-display)]">
                First Invite Role
              </label>
              <div className="space-y-2">
                {ROLE_OPTIONS.map(({ value, label, desc, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setInviteRole(value)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      inviteRole === value
                        ? "border-[#FF6B35]/50 bg-[#FF6B35]/8"
                        : "border-[#2A2A2A] bg-[#0F0F0F] hover:border-[#3A3A3A]"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      inviteRole === value ? "bg-[#FF6B35]/15" : "bg-[#242424]"
                    }`}>
                      <Icon size={16} className={inviteRole === value ? "text-[#FF6B35]" : color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold font-[var(--font-display)] tracking-wide ${
                        inviteRole === value ? "text-[#F5F5F5]" : "text-[#888]"
                      }`}>{label}</p>
                      <p className="text-[11px] text-[#444] truncate">{desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      inviteRole === value ? "border-[#FF6B35] bg-[#FF6B35]" : "border-[#333]"
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="secondary" className="flex-1" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={!name.trim() || isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 size={14} className="animate-spin" /> Creating…</>
                ) : (
                  <><Plus size={14} /> Create & Get Code</>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ── STEP 2: Invite code ── */}
        {step === "invite" && result && (
          <div className="space-y-4">
            {/* Success banner */}
            <div className="flex items-center gap-2.5 p-3 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl">
              <div className="w-7 h-7 bg-[#22C55E]/15 rounded-lg flex items-center justify-center">
                <Check size={14} className="text-[#22C55E]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#22C55E] font-[var(--font-display)] tracking-wide uppercase">
                  Company created!
                </p>
                <p className="text-[11px] text-[#22C55E]/60">
                  {result.location.brand ? `${result.location.brand} — ` : ""}{result.location.name}
                </p>
              </div>
            </div>

            {result.invite ? (
              <>
                {/* Big code */}
                <div className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl p-5 text-center">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#555] font-[var(--font-display)] mb-2">
                    {ROLE_OPTIONS.find(r => r.value === result.invite!.role)?.label} Invite Code
                  </p>
                  <p className="text-4xl font-bold tracking-[0.2em] font-[var(--font-display)] text-[#FF6B35]">
                    {result.invite.code}
                  </p>
                  <p className="text-xs text-[#444] mt-2">
                    Expires in 30 days · Single use
                  </p>
                </div>

                {/* Copy code */}
                <button
                  onClick={() => copyToClipboard(result.invite!.code, "code")}
                  className="w-full flex items-center justify-between p-3 bg-[#242424] hover:bg-[#2A2A2A] border border-[#2A2A2A] rounded-lg transition-colors group"
                >
                  <span className="text-sm text-[#888] font-mono">{result.invite.code}</span>
                  {copied === "code"
                    ? <Check size={16} className="text-[#22C55E]" />
                    : <Copy size={16} className="text-[#555] group-hover:text-[#888]" />}
                </button>

                {/* Copy link */}
                <button
                  onClick={() => copyToClipboard(`${appUrl}/join/${result.invite!.code}`, "link")}
                  className="w-full flex items-center justify-between p-3 bg-[#242424] hover:bg-[#2A2A2A] border border-[#2A2A2A] rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <LinkIcon size={13} className="text-[#555] flex-shrink-0" />
                    <span className="text-sm text-[#888] truncate">
                      {appUrl}/join/{result.invite.code}
                    </span>
                  </div>
                  {copied === "link"
                    ? <Check size={16} className="text-[#22C55E] flex-shrink-0 ml-2" />
                    : <Copy size={16} className="text-[#555] group-hover:text-[#888] flex-shrink-0 ml-2" />}
                </button>
              </>
            ) : (
              <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl text-sm text-[#F59E0B]">
                Company created but invite code generation failed. You can generate one from the company detail page.
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button variant="secondary" className="flex-1" onClick={handleClose}>
                Done
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (result?.location) {
                    window.location.href = `/admin/companies/${result.location.id}`;
                  }
                }}
              >
                View Company →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/companies")
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data.companies ?? []);
        setIsLoading(false);
      });
  }, []);

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.brand ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-wide font-[var(--font-display)] uppercase text-[#F5F5F5]">
            Companies
          </h1>
          <p className="text-sm text-[#555] mt-1">
            {companies.length} total location{companies.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} />
          New Company
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
        <input
          type="text"
          placeholder="Search companies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-9 pr-4 text-sm text-[#F5F5F5] placeholder:text-[#444] focus:outline-none focus:border-[#FF6B35] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="space-y-px">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-[#1A1A1A] animate-pulse border-b border-[#2A2A2A]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 size={28} className="text-[#333] mb-3" />
            <p className="text-sm text-[#555] font-[var(--font-display)] tracking-wide uppercase font-bold mb-4">
              {search ? "No matches found" : "No companies yet"}
            </p>
            {!search && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus size={14} />
                Create First Company
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  <th className="text-left p-4 text-xs font-bold tracking-widest uppercase text-[#555] font-[var(--font-display)]">Company</th>
                  <th className="text-right p-4 text-xs font-bold tracking-widest uppercase text-[#555] font-[var(--font-display)] hidden sm:table-cell">Members</th>
                  <th className="text-right p-4 text-xs font-bold tracking-widest uppercase text-[#555] font-[var(--font-display)] hidden md:table-cell">Messages</th>
                  <th className="text-right p-4 text-xs font-bold tracking-widest uppercase text-[#555] font-[var(--font-display)] hidden lg:table-cell">Shifts</th>
                  <th className="text-right p-4 text-xs font-bold tracking-widest uppercase text-[#555] font-[var(--font-display)] hidden md:table-cell">Created</th>
                  <th className="p-4 w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b border-[#2A2A2A] last:border-0 hover:bg-[#242424] transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#242424] rounded-xl flex items-center justify-center border border-[#2A2A2A] flex-shrink-0">
                          <Building2 size={16} className="text-[#555]" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#F5F5F5] font-[var(--font-display)] tracking-wide">
                            {company.name}
                          </p>
                          {company.brand && (
                            <p className="text-xs text-[#555]">{company.brand}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right hidden sm:table-cell">
                      <div className="flex items-center justify-end gap-1.5">
                        <Users size={12} className="text-[#444]" />
                        <span className="text-sm font-bold text-[#888] font-[var(--font-display)]">
                          {company.member_count}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right hidden md:table-cell">
                      <div className="flex items-center justify-end gap-1.5">
                        <MessageSquare size={12} className="text-[#444]" />
                        <span className="text-sm font-bold text-[#888] font-[var(--font-display)]">
                          {company.message_count.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right hidden lg:table-cell">
                      <div className="flex items-center justify-end gap-1.5">
                        <Calendar size={12} className="text-[#444]" />
                        <span className="text-sm font-bold text-[#888] font-[var(--font-display)]">
                          {company.shift_count}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right hidden md:table-cell">
                      <span className="text-xs text-[#555]">
                        {formatRelativeTime(company.created_at)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/companies/${company.id}`}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-[#444] hover:text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-all"
                      >
                        <ArrowUpRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      <CreateCompanyModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(company) => setCompanies((prev) => [company, ...prev])}
      />
    </div>
  );
}
