import { redirect } from "next/navigation";

// OTP verify no longer used — email/password auth handles everything on /login
export default function VerifyPage() {
  redirect("/login");
}
