// tests/components/BuildList.test.tsx
import { Suspense } from "react";
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuildList } from "@/app/components/BuildList";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("BuildList", () => {
  test("starts with one build row", () => {
    render(
      <Suspense fallback={null}>
        <BuildList />
      </Suspense>
    );
    expect(screen.getAllByTestId("bullets-per-second")).toHaveLength(1);
  });

  test("appends a new build row when Add build is clicked", async () => {
    render(
      <Suspense fallback={null}>
        <BuildList />
      </Suspense>
    );
    await userEvent.click(screen.getByRole("button", { name: /add build/i }));
    expect(screen.getAllByTestId("bullets-per-second")).toHaveLength(2);
  });

  test("removes a build row when its remove button is clicked", async () => {
    render(
      <Suspense fallback={null}>
        <BuildList />
      </Suspense>
    );
    await userEvent.click(screen.getByRole("button", { name: /add build/i }));
    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    await userEvent.click(removeButtons[0]);
    expect(screen.getAllByTestId("bullets-per-second")).toHaveLength(1);
  });

  test("does not remove the last remaining row", async () => {
    render(
      <Suspense fallback={null}>
        <BuildList />
      </Suspense>
    );
    const removeButton = screen.getByRole("button", { name: /remove/i });
    await userEvent.click(removeButton);
    expect(screen.getAllByTestId("bullets-per-second")).toHaveLength(1);
  });
});
