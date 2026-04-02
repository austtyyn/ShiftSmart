export const dynamic = "force-dynamic";

import { AppShell } from "./_shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
