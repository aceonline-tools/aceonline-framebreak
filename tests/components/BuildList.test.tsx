// tests/components/BuildList.test.tsx
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuildList } from "@/app/components/BuildList";

describe("BuildList", () => {
  test("starts with one build row", () => {
    render(<BuildList />);
    expect(screen.getAllByTestId("bullets-per-second")).toHaveLength(1);
  });

  test("appends a new build row when Add build is clicked", async () => {
    render(<BuildList />);
    await userEvent.click(screen.getByRole("button", { name: /add build/i }));
    expect(screen.getAllByTestId("bullets-per-second")).toHaveLength(2);
  });

  test("removes a build row when its remove button is clicked", async () => {
    render(<BuildList />);
    await userEvent.click(screen.getByRole("button", { name: /add build/i }));
    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    await userEvent.click(removeButtons[0]);
    expect(screen.getAllByTestId("bullets-per-second")).toHaveLength(1);
  });

  test("does not remove the last remaining row", async () => {
    render(<BuildList />);
    const removeButton = screen.getByRole("button", { name: /remove/i });
    await userEvent.click(removeButton);
    expect(screen.getAllByTestId("bullets-per-second")).toHaveLength(1);
  });
});
