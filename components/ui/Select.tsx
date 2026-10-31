import {
  Select as AriaSelect,
  Label as AriaLabel,
  Button as AriaButton,
  SelectValue as AriaSelectValue,
  Popover as AriaPopover,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  type Key
} from "react-aria-components";

export {
  AriaSelect as Select,
  AriaLabel as Label,
  AriaButton as Button,
  AriaSelectValue as SelectValue,
  AriaPopover as Popover,
  AriaListBox as ListBox,
  AriaListBoxItem as ListBoxItem
};

export interface SelectOption {
  id: string;
  name: string;
  secondaryText?: string;
}

export interface AppSelectProps {
  label?: string;
  "aria-label"?: string;
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  popoverClassName?: string;
  isDisabled?: boolean;
}

export function AppSelect({
  label,
  "aria-label": ariaLabel,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  options,
  placeholder = "Select an option",
  className = "",
  buttonClassName = "",
  popoverClassName = "",
  isDisabled = false
}: AppSelectProps) {
  return (
    <AriaSelect
      selectedKey={selectedKey}
      defaultSelectedKey={defaultSelectedKey}
      onSelectionChange={(key: Key | null) => {
        if (key !== null) {
          onSelectionChange?.(String(key));
        }
      }}
      aria-label={ariaLabel ?? label}
      isDisabled={isDisabled}
      className={`app-aria-select ${className}`}
    >
      {label && <AriaLabel className="app-select-label">{label}</AriaLabel>}
      <AriaButton className={`app-select-trigger ${buttonClassName}`}>
        <AriaSelectValue className="app-select-value">
          {({ selectedText }) => selectedText || placeholder}
        </AriaSelectValue>
        <svg
          className="app-select-chevron"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </AriaButton>
      <AriaPopover className={`app-select-popover ${popoverClassName}`}>
        <AriaListBox className="app-select-listbox">
          {options.map((option) => (
            <AriaListBoxItem
              key={option.id}
              id={option.id}
              textValue={option.name}
              className="app-select-item"
            >
              <span className="app-select-item-name">{option.name}</span>
              {option.secondaryText && (
                <span className="app-select-item-secondary">
                  {option.secondaryText}
                </span>
              )}
            </AriaListBoxItem>
          ))}
        </AriaListBox>
      </AriaPopover>
    </AriaSelect>
  );
}

export default AppSelect;
