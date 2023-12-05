import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-3xl">Weave</h1>
      <Link href="/(event)">
      <Button>Event Page!</Button>
      </Link>

      <Link href="/landing-page">
      <Button>landing page!</Button>
      </Link>
    </main>
  );
}
