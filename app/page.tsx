// app/page.tsx
import { Suspense } from "react";
import { BuildList } from "@/app/components/BuildList";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Ace Online</h1>
        <p className="text-sm text-neutral-500">Tính đạn AG</p>
      </header>
      <Suspense fallback={null}>
        <BuildList />
      </Suspense>
    </main>
  );
}
