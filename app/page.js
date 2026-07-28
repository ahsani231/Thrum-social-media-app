import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LandingHero from "@/components/LandingHero";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  return <LandingHero />;
}
