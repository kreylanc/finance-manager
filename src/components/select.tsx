import CreatableSelect from "react-select/creatable";
import { SingleValue } from "react-select";
import { useMemo } from "react";

type Props = {
  onChange: (value?: string) => void;
  onCreate?: (value: string) => void;
  options?: { label: string; value: string }[];
  value?: string | null | undefined;
  disabled?: boolean;
  placeholder?: string;
  clearable?: boolean;
};

const Select = ({
  onChange,
  onCreate,
  options = [],
  value,
  disabled,
  placeholder,
  clearable,
}: Props) => {
  const onSelect = (option: SingleValue<{ label: string; value: string }>) => {
    onChange(option?.value);
  };

  const formattedValue = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  return (
    <CreatableSelect
      placeholder={placeholder}
      className="text-sm h-10"
      styles={{
        control: (base) => ({
          ...base,
          borderColor: "#e2e8f0",
          padding: "1.5px",
          borderRadius: "calc(var(--radius) - 2px)",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "hsl(var(--muted))",
            borderColor: "#e2e8f0",
            cursor: "pointer",
          },
        }),
      }}
      value={formattedValue}
      onChange={onSelect}
      options={options}
      onCreateOption={onCreate}
      isDisabled={disabled}
      isClearable={clearable}
    />
  );
};

export default Select;
