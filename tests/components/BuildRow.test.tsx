// tests/components/BuildRow.test.tsx
import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuildRow } from "@/app/components/BuildRow";
import { aGearData, defaultAGearBuild } from "@/data/gears/a-gear";

describe("BuildRow", () => {
  test("renders inputs for base, prefix, suffix, low card, hyper card", () => {
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={() => {}} onRemove={() => {}} />
    );

    expect(screen.getByLabelText(/^base$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prefix/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/suffix/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/low card/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hyper card/i)).toBeInTheDocument();
  });

  test("renders a BPS table with the (0,0) cell showing the zero-quantity result", () => {
    const buildWithEnchantsSelected = {
      ...defaultAGearBuild,
      lowCardId: "low-card",
      hyperCardId: "hyper-card",
    };
    render(
      <BuildRow
        build={buildWithEnchantsSelected}
        gearData={aGearData}
        onChange={() => {}}
        onRemove={() => {}}
      />
    );

    // default base 1.5 with no modifiers → 3 / 1.5 = 2.00
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

    await userEvent.selectOptions(screen.getByLabelText(/prefix/i), "prefix-13");
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ prefixId: "prefix-13" }));
  });

  test("calls onChange when the user edits the base", () => {
    const handleChange = vi.fn();
    render(
      <BuildRow build={defaultAGearBuild} gearData={aGearData} onChange={handleChange} onRemove={() => {}} />
    );

    const baseInput = screen.getByLabelText(/^base$/i);
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

  test("opens the breakdown panel when a table cell is clicked and closes it when clicked again", async () => {
    const buildWithEnchantsSelected = {
      ...defaultAGearBuild,
      prefixId: "prefix-13",
      suffixId: "suffix-14",
      lowCardId: "low-card",
      hyperCardId: "hyper-card",
    };
    render(
      <BuildRow
        build={buildWithEnchantsSelected}
        gearData={aGearData}
        onChange={() => {}}
        onRemove={() => {}}
      />
    );

    expect(screen.queryByTestId("cell-breakdown")).toBeNull();

    const firstBodyRow = within(screen.getByRole("table")).getAllByRole("row")[1];
    const firstDataCell = within(firstBodyRow).getAllByRole("cell")[0];
    const firstCellButton = within(firstDataCell).getByRole("button");

    await userEvent.click(firstCellButton);
    const breakdown = screen.getByTestId("cell-breakdown");
    expect(breakdown).toBeInTheDocument();
    expect(breakdown).toHaveTextContent("Prefix -13%");
    expect(breakdown).toHaveTextContent("Suffix -14%");

    await userEvent.click(firstCellButton);
    expect(screen.queryByTestId("cell-breakdown")).toBeNull();
  });
});
