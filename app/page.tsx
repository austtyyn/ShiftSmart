import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F5F5F5] font-[Inter,sans-serif] overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1A1A1A] bg-[#0F0F0F]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold tracking-tight">
            SHIFT<span className="text-[#FF6B35]">SMART</span>
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-[#888] hover:text-[#F5F5F5] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="bg-[#FF6B35] hover:bg-[#FF8555] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-40 pb-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-[#FF6B35] text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-[#FF6B35] rounded-full animate-pulse" />
            Built for shift-based teams
          </div>

          <h1 className="font-['Barlow_Condensed',sans-serif] text-6xl sm:text-7xl md:text-8xl font-bold leading-[0.95] tracking-tight mb-8 uppercase">
            The chat app that{" "}
            <span className="text-[#FF6B35]">survives</span>{" "}
            your worst hire
          </h1>

          <p className="text-lg sm:text-xl text-[#888] max-w-2xl mx-auto mb-10 leading-relaxed">
            When crew leaves, your history stays. ShiftSmart gives every store a
            permanent channel — add or remove members instantly without
            rebuilding the group chat from scratch. Ever again.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-[#FF6B35] hover:bg-[#FF8555] text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors font-['Barlow_Condensed',sans-serif] tracking-wide uppercase"
            >
              Start for Free →
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto border border-[#2A2A2A] hover:border-[#3A3A3A] text-[#888] hover:text-[#F5F5F5] font-semibold text-base px-8 py-4 rounded-xl transition-colors"
            >
              See how it works
            </a>
          </div>

          <p className="mt-5 text-xs text-[#555]">
            No app download required · Works on any phone browser
          </p>
        </div>
      </section>

      {/* ── Pain / Before-After ── */}
      <section className="py-20 px-6 border-y border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold tracking-widest uppercase text-[#555] mb-12 font-['Barlow_Condensed',sans-serif]">
            Sound familiar?
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="bg-[#EF4444]/5 border border-[#EF4444]/15 rounded-2xl p-8">
              <div className="text-[#EF4444] text-xs font-bold tracking-widest uppercase mb-6 font-['Barlow_Condensed',sans-serif]">
                ✕ Without ShiftSmart
              </div>
              <ul className="space-y-4 text-[#888] text-sm leading-relaxed">
                {[
                  "Employee quits → you delete the group chat, rebuild it, re-add 14 people",
                  "New hire can't see last month's announcements — asks about policy that was already posted",
                  "Someone who left still reads your private shift convos",
                  "Schedule is buried in a thread. No one knows who's working Saturday.",
                  "Manager posts a safety announcement — no way to know who read it",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="text-[#EF4444] mt-0.5 flex-shrink-0">✕</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="bg-[#22C55E]/5 border border-[#22C55E]/15 rounded-2xl p-8">
              <div className="text-[#22C55E] text-xs font-bold tracking-widest uppercase mb-6 font-['Barlow_Condensed',sans-serif]">
                ✓ With ShiftSmart
              </div>
              <ul className="space-y-4 text-[#888] text-sm leading-relaxed">
                {[
                  "Employee quits → one click removes them. History stays. Channel stays. Nothing to rebuild.",
                  "New hires see full message history the second they join with an invite code.",
                  "Removed members instantly lose access — zero risk of info leaking.",
                  "Weekly schedule grid on every device. Who's working today is always one tap away.",
                  "Announcements track acknowledgements live — you know exactly who hasn't read it.",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="text-[#22C55E] mt-0.5 flex-shrink-0">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs font-bold tracking-widest uppercase text-[#FF6B35] mb-4 font-['Barlow_Condensed',sans-serif]">
              Everything your team needs
            </p>
            <h2 className="font-['Barlow_Condensed',sans-serif] text-5xl sm:text-6xl font-bold uppercase tracking-tight">
              Built for the floor,<br />not the boardroom
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: "💬",
                title: "Persistent Channel",
                desc: "One permanent group chat per store. Full history survives every hire and every quit — forever.",
              },
              {
                icon: "🔐",
                title: "Instant Access Control",
                desc: "Share a 6-digit invite code to add crew. One click to remove them. Ex-employees are locked out the second you act.",
              },
              {
                icon: "📢",
                title: "Announcement Acknowledgements",
                desc: "Post a pinned announcement and watch live as each crew member taps Acknowledge. Chase-up reminders if someone hasn't read it in 24hrs.",
              },
              {
                icon: "📅",
                title: "Weekly Schedule Grid",
                desc: "Drag-and-drop shifts onto a visual weekly calendar. Crew see their shifts highlighted. Managers see the full picture.",
              },
              {
                icon: "👥",
                title: "Role-Based Permissions",
                desc: "Owner, Manager, and Crew roles — each with the right level of access. Promote crew, demote managers, all in seconds.",
              },
              {
                icon: "📱",
                title: "No Download Required",
                desc: "ShiftSmart runs in any phone browser. Send your crew a link — they're in. No App Store, no Google Play, no friction.",
              },
              {
                icon: "🕐",
                title: "Who's Working Today",
                desc: "Live widget on the chat page showing today's shift roster. Always know who's on the clock right now.",
              },
              {
                icon: "🏪",
                title: "Multi-Location Ready",
                desc: "Run a dozen locations from one account. Each store gets its own channel, team, and schedule — completely isolated.",
              },
              {
                icon: "⚡",
                title: "Real-Time Everything",
                desc: "Messages appear instantly across all devices. No refresh, no delay — powered by Supabase Realtime.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-7 hover:border-[#FF6B35]/30 transition-colors group"
              >
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-['Barlow_Condensed',sans-serif] text-xl font-bold uppercase tracking-wide mb-2 group-hover:text-[#FF6B35] transition-colors">
                  {title}
                </h3>
                <p className="text-[#888] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-28 px-6 bg-[#0A0A0A] border-y border-[#1A1A1A]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs font-bold tracking-widest uppercase text-[#FF6B35] mb-4 font-['Barlow_Condensed',sans-serif]">
              Up in minutes
            </p>
            <h2 className="font-['Barlow_Condensed',sans-serif] text-5xl sm:text-6xl font-bold uppercase tracking-tight">
              Set up in 3 steps
            </h2>
          </div>

          <div className="space-y-5">
            {[
              {
                step: "01",
                title: "Create your store",
                desc: "Sign up, enter your store name. Your permanent channel is live immediately — no configuration needed.",
              },
              {
                step: "02",
                title: "Invite your team",
                desc: "Generate a 6-digit invite code and text it to your crew. They open the link, tap the code, and they're in — with full history from day one.",
              },
              {
                step: "03",
                title: "Run your shift",
                desc: "Message in real-time, post announcements, manage the schedule, see who's working — all from the same place.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex gap-6 items-start bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-7"
              >
                <span className="font-['Barlow_Condensed',sans-serif] text-5xl font-bold text-[#FF6B35]/20 leading-none flex-shrink-0 w-16 text-right">
                  {step}
                </span>
                <div>
                  <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold uppercase tracking-wide mb-2">
                    {title}
                  </h3>
                  <p className="text-[#888] text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold tracking-widest uppercase text-[#555] mb-14 font-['Barlow_Condensed',sans-serif]">
            What managers say
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                quote:
                  "We used to dread when anyone quit because we had to redo the whole group chat. ShiftSmart just removed that problem entirely.",
                name: "Marcus T.",
                role: "Shift Lead · Fast Food",
              },
              {
                quote:
                  "Posting an announcement and being able to see exactly who hasn't acknowledged it — that alone is worth it for a GM.",
                name: "Priya N.",
                role: "General Manager · Retail",
              },
              {
                quote:
                  "My crew is on it because there's nothing to download. I sent them a link, they opened it in Safari, done.",
                name: "Jordan L.",
                role: "Owner · Hospitality",
              },
            ].map(({ quote, name, role }) => (
              <div
                key={name}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-7 flex flex-col justify-between"
              >
                <p className="text-[#888] text-sm leading-relaxed mb-8 italic">
                  &ldquo;{quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-xs text-[#555]">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6 border-t border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-['Barlow_Condensed',sans-serif] text-5xl sm:text-7xl font-bold uppercase tracking-tight leading-[0.95] mb-8">
            Stop rebuilding your{" "}
            <span className="text-[#FF6B35]">group chat</span>
          </h2>
          <p className="text-[#888] text-lg mb-10">
            ShiftSmart is free to get started. Set up your store in under 5
            minutes.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#FF6B35] hover:bg-[#FF8555] text-white font-bold text-xl px-10 py-5 rounded-xl transition-colors font-['Barlow_Condensed',sans-serif] tracking-wide uppercase"
          >
            Create Your Store Free →
          </Link>
          <p className="mt-5 text-xs text-[#444]">
            No credit card · No app download · Works on any device
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1A1A1A] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-['Barlow_Condensed',sans-serif] text-xl font-bold tracking-tight">
            SHIFT<span className="text-[#FF6B35]">SMART</span>
          </span>
          <p className="text-xs text-[#444]">
            © {new Date().getFullYear()} ShiftSmart. Built for the people who actually run the floor.
          </p>
          <Link
            href="/login"
            className="text-xs text-[#555] hover:text-[#FF6B35] transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </footer>

    </div>
  );
}
