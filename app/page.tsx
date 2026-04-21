// app/page.tsx
import { Suspense } from "react";
import { BuildList } from "@/app/components/BuildList";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Ace Online BPS Calculator</h1>
      <Suspense fallback={null}>
        <BuildList />
      </Suspense>
    </main>
  );
}
