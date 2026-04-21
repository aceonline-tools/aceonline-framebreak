// tests/components/BuildRow.test.tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuildRow } from "@/app/components/BuildRow";
import { aGearData, defaultAGearBuild } from "@/data/gears/a-gear";

describe("BuildRow", () => {
  test("renders dropdowns for weapon, prefix, suffix, low card, hyper card", () => {
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={() => {}} onRemove={() => {}} />
    );

    expect(screen.getByLabelText(/weapon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prefix/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/suffix/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/low card/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hyper card/i)).toBeInTheDocument();
  });

  test("displays a bullets-per-second number computed from the build", () => {
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={() => {}} onRemove={() => {}} />
    );

    // default build has all zero modifiers; base = 1.5 → 3 / 1.5 = 2.00
    expect(screen.getByTestId("bullets-per-second")).toHaveTextContent("2.00");
  });

  test("calls onChange when the user picks a new prefix", async () => {
    const handleChange = vi.fn();
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={handleChange} onRemove={() => {}} />
    );

    await userEvent.selectOptions(screen.getByLabelText(/prefix/i), "rapid");
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ prefixId: "rapid" }));
  });

  test("calls onRemove when the delete button is clicked", async () => {
    const handleRemove = vi.fn();
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={() => {}} onRemove={handleRemove} />
    );

    await userEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(handleRemove).toHaveBeenCalled();
  });
});
