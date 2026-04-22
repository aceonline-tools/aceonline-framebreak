// app/page.tsx
import { Suspense } from "react";
import { BuildList } from "@/app/components/BuildList";
import { StatsBar } from "@/app/components/StatsBar";
import { WelcomeCard } from "@/app/components/WelcomeCard";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col overflow-x-hidden p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Ace Online</h1>
        <p className="text-sm text-neutral-500">Tính đạn AG</p>
      </header>
      <WelcomeCard />
      <Suspense fallback={null}>
        <BuildList />
      </Suspense>
      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4 text-xs tracking-wide text-neutral-500 sm:mt-auto sm:pt-6">
        <StatsBar />
        <span>
          Built by <span className="font-semibold text-neutral-700">supcua</span>
        </span>
      </footer>
    </main>
  );
}
