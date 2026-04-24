// tests/components/BuildRow.test.tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuildRow } from "@/app/components/BuildRow";
import { aGearData, defaultAGearBuild } from "@/data/gears/a-gear";

describe("BuildRow", () => {
  test("renders selects for weapon, prefix, and suffix", () => {
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={() => {}} onRemove={() => {}} />
    );

    expect(screen.getByLabelText(/vũ khí/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sup đầu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sup đuôi/i)).toBeInTheDocument();
  });

  test("renders a BPS table with the (0,0) cell showing the zero-quantity result once the full grid is revealed", async () => {
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

    await userEvent.click(screen.getByRole("button", { name: /xem toàn bảng/i }));

    // base 1.5 with no modifiers → 3 / 1.5 = 2.00 at (0,0) — now the bottom-right cell
    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    const lastBodyRow = rows[rows.length - 1];
    const lastRowCells = within(lastBodyRow).getAllByRole("cell");
    const zeroZeroCell = lastRowCells[lastRowCells.length - 1];
    expect(zeroZeroCell).toHaveTextContent("2.00");
  });

  test("calls onChange when the user picks a new prefix", async () => {
    const handleChange = vi.fn();
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={handleChange} onRemove={() => {}} />
    );

    const prefixControl = screen.getByLabelText(/sup đầu/i);
    await userEvent.click(prefixControl);
    await userEvent.click(await screen.findByText("Attack", { selector: "div" }));
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ prefixId: "attack" }));
  });

  test("calls onChange with the weapon's base when the user picks a new weapon", async () => {
    const handleChange = vi.fn();
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={handleChange} onRemove={() => {}} />
    );

    const weaponControl = screen.getByLabelText(/vũ khí/i);
    await userEvent.click(weaponControl);
    await userEvent.click(await screen.findByText("Rantee1", { selector: "div" }));
    expect(handleChange).toHaveBeenLastCalledWith(expect.objectContaining({ base: 0.3, weaponId: "rantee-1" }));
  });

  test("calls onRemove when the delete button is clicked", async () => {
    const handleRemove = vi.fn();
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={() => {}} onRemove={handleRemove} />
    );

    await userEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(handleRemove).toHaveBeenCalled();
  });

  test("does not render a CellBreakdown — it now lives in the ComparisonPanel", () => {
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={() => {}} onRemove={() => {}} />
    );
    expect(screen.queryByTestId("cell-breakdown")).not.toBeInTheDocument();
  });

  test("toggling a cell in the full grid emits an updated selectedCells array", async () => {
    const handleChange = vi.fn();
    const buildWithCellSelected = {
      base: 0.45,
      prefixId: "none",
      suffixId: "none",
      selectedCells: [{ lowQuantity: 10, hyperQuantity: 6 }],
    };
    render(
      <BuildRow
        build={buildWithCellSelected}
        gearData={aGearData}
        onChange={handleChange}
        onRemove={() => {}}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /xem toàn bảng/i }));
    const allRows = within(screen.getByRole("table")).getAllByRole("row");
    const lastBodyRow = allRows[allRows.length - 1]; // hyper=0 row
    const lastRowCells = within(lastBodyRow).getAllByRole("cell");
    const zeroZeroCell = lastRowCells[lastRowCells.length - 1]; // low=0, hyper=0
    const zeroZeroCellButton = within(zeroZeroCell).getByRole("button");

    await userEvent.click(zeroZeroCellButton);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedCells: expect.arrayContaining([
          { lowQuantity: 10, hyperQuantity: 6 },
          { lowQuantity: 0, hyperQuantity: 0 },
        ]),
      }),
    );
  });
});
