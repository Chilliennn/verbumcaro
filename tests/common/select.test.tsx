import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppSelect } from "../../components/ui/Select";

describe("AppSelect component (react-aria-components)", () => {
  const options = [
    { id: "catholic_org", name: "Catholic Public Domain", secondaryText: "English" },
    { id: "vulgate", name: "Biblia Sacra Vulgata", secondaryText: "Latin" },
    { id: "sigao", name: "Sigao Chinese", secondaryText: "Chinese" }
  ];

  it("renders trigger with initial selected value", () => {
    render(
      <AppSelect
        label="Translation"
        selectedKey="catholic_org"
        options={options}
      />
    );

    const button = screen.getByRole("button", { name: /Translation/i });
    expect(button).toBeDefined();
    expect(button.textContent).toContain("Catholic Public Domain");
  });

  it("opens listbox popover and allows selection", () => {
    const onSelectionChange = vi.fn();
    render(
      <AppSelect
        aria-label="Select translation"
        selectedKey="catholic_org"
        options={options}
        onSelectionChange={onSelectionChange}
      />
    );

    const trigger = screen.getByRole("button", { name: /Select translation/i });
    fireEvent.click(trigger);

    const latinOption = screen.getByRole("option", { name: /Biblia Sacra Vulgata/i });
    expect(latinOption).toBeDefined();
    fireEvent.click(latinOption);

    expect(onSelectionChange).toHaveBeenCalledWith("vulgate");
  });

  it("supports disabled state", () => {
    render(
      <AppSelect
        aria-label="Disabled Select"
        selectedKey="catholic_org"
        options={options}
        isDisabled={true}
      />
    );

    const trigger = screen.getByRole("button", { name: /Disabled Select/i });
    expect(trigger.getAttribute("disabled")).not.toBeNull();
  });
});
