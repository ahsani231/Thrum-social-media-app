import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Log in — Thrum" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Pick up the thread."
      subtitle="Log in to see what your circle has been stitching together."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="text-gold hover:text-gold-soft">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
