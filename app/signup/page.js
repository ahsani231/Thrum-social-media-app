import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AuthShell from "@/components/AuthShell";
import SignupForm from "@/components/SignupForm";

export const metadata = { title: "Join Thrum" };

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  return (
    <AuthShell
      eyebrow="Get started"
      title="Start your thread."
      subtitle="A profile, a handle, and a place to post — that's all it takes."
      footer={
        <>
          Already on Thrum?{" "}
          <Link href="/login" className="text-gold hover:text-gold-soft">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
