// tests/components/BuildRow.test.tsx
import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuildRow } from "@/app/components/BuildRow";
import { aGearData, defaultAGearBuild } from "@/data/gears/a-gear";

describe("BuildRow", () => {
  test("renders inputs for base, prefix, and suffix", () => {
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={() => {}} onRemove={() => {}} />
    );

    expect(screen.getByLabelText(/tck cơ bản/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sup đầu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sup đuôi/i)).toBeInTheDocument();
  });

  test("renders a BPS table with the (0,0) cell showing the zero-quantity result", () => {
    const buildWithNoModifiers = {
      base: 1.5,
      prefixId: "none",
      suffixId: "none",
    };
    render(
      <BuildRow
        build={buildWithNoModifiers}
        gearData={aGearData}
        onChange={() => {}}
        onRemove={() => {}}
      />
    );

    // base 1.5 with no modifiers → 3 / 1.5 = 2.00
    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    const firstBodyRow = rows[1]; // row 0 is header
    const firstDataCell = within(firstBodyRow).getAllByRole("cell")[0];
    expect(firstDataCell).toHaveTextContent("2.00");
  });

  test("calls onChange when the user picks a new prefix", async () => {
    const handleChange = vi.fn();
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={handleChange} onRemove={() => {}} />
    );

    await userEvent.selectOptions(screen.getByLabelText(/sup đầu/i), "prefix-13");
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ prefixId: "prefix-13" }));
  });

  test("calls onChange when the user edits the base", () => {
    const handleChange = vi.fn();
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={handleChange} onRemove={() => {}} />
    );

    const baseInput = screen.getByLabelText(/tck cơ bản/i);
    fireEvent.change(baseInput, { target: { value: "2.5" } });
    expect(handleChange).toHaveBeenLastCalledWith(expect.objectContaining({ base: 2.5 }));
  });

  test("calls onRemove when the delete button is clicked", async () => {
    const handleRemove = vi.fn();
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={() => {}} onRemove={handleRemove} />
    );

    await userEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(handleRemove).toHaveBeenCalled();
  });

  test("opens the breakdown at the max-quantity cell by default and toggles on click", async () => {
    const buildWithModifiers = {
      base: 0.45,
      prefixId: "prefix-13",
      suffixId: "suffix-14",
    };
    render(
      <BuildRow
        build={buildWithModifiers}
        gearData={aGearData}
        onChange={() => {}}
        onRemove={() => {}}
      />
    );

    const initialBreakdown = screen.getByTestId("cell-breakdown");
    expect(initialBreakdown).toBeInTheDocument();
    // default selected cell is (low=10, hyper=6) using the Vietnamese labels
    expect(initialBreakdown).toHaveTextContent("Tck thường × 10");
    expect(initialBreakdown).toHaveTextContent("Tck DB × 6");

    const firstBodyRow = within(screen.getByRole("table")).getAllByRole("row")[1];
    const firstDataCell = within(firstBodyRow).getAllByRole("cell")[0];
    const firstCellButton = within(firstDataCell).getByRole("button");

    await userEvent.click(firstCellButton);
    const switchedBreakdown = screen.getByTestId("cell-breakdown");
    expect(switchedBreakdown).toHaveTextContent("Tck thường × 0");
    expect(switchedBreakdown).toHaveTextContent("Tck DB × 0");
    // Total modifier at (0,0) with prefix -13% + suffix -14% = -27%
    expect(switchedBreakdown).toHaveTextContent("-27%");

    await userEvent.click(firstCellButton);
    expect(screen.queryByTestId("cell-breakdown")).toBeNull();
  });
});
