// tests/components/BuildList.test.tsx
import { Suspense } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuildList } from "@/app/components/BuildList";

const replaceMock = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => currentSearchParams,
}));

beforeEach(() => {
  replaceMock.mockClear();
  currentSearchParams = new URLSearchParams();
});

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

  test("writes encoded builds to the URL when a row is added", async () => {
    render(
      <Suspense fallback={null}>
        <BuildList />
      </Suspense>
    );
    replaceMock.mockClear();

    await userEvent.click(screen.getByRole("button", { name: /add build/i }));

    expect(replaceMock).toHaveBeenCalled();
    const [lastCallPath] = replaceMock.mock.calls[replaceMock.mock.calls.length - 1];
    expect(lastCallPath).toMatch(/^\?builds=/);
    expect(lastCallPath.split(";")).toHaveLength(2);
  });

  test("seeds initial rows from the builds query param", () => {
    currentSearchParams = new URLSearchParams(
      "builds=placeholder-weapon-2.none.none.none.0.none.0"
    );
    render(
      <Suspense fallback={null}>
        <BuildList />
      </Suspense>
    );

    expect(screen.getAllByTestId("bullets-per-second")).toHaveLength(1);
    const weaponSelect = screen.getByLabelText(/weapon/i) as HTMLSelectElement;
    expect(weaponSelect.value).toBe("placeholder-weapon-2");
  });
});
